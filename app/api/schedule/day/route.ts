import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSessionScheduledForDate, getTimeForDate } from '@/lib/schedule';
import type { ApiResponse, Student, Holiday } from '@/types';

interface DayEntry {
  studentName: string;
  studentId: string;
  time: string;
  source: 'schedule' | 'adhoc';
  status?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { ok: false, message: 'date query parameter is required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(dateParam + 'T00:00:00');
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { ok: false, message: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch holidays and check if date is a holiday
    const { data: holidaysData } = await supabase
      .from('holidays')
      .select('*')
      .order('from_date', { ascending: true });
    const holidays: Holiday[] = holidaysData || [];
    const isHolidayDate = holidays.some(
      h => dateParam >= h.from_date && dateParam <= h.to_date
    );

    // Fetch active students
    const { data: studentsData } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);
    const students: Student[] = studentsData || [];

    const entries: DayEntry[] = [];
    const seen = new Set<string>();

    // 1. Regular schedule entries
    for (const student of students) {
      if (isSessionScheduledForDate(student, targetDate, holidays)) {
        const time = getTimeForDate(student, targetDate);
        const key = `${student.id}-${time}`;
        seen.add(key);
        entries.push({
          studentName: student.name,
          studentId: student.id,
          time,
          source: 'schedule',
        });
      }
    }

    // 2. DB sessions for that date (adhoc + recorded)
    const { data: dbSessions } = await supabase
      .from('sessions')
      .select('*, students!inner(id, name)')
      .eq('date', dateParam)
      .neq('status', 'canceled');

    for (const sess of dbSessions || []) {
      const studentId = sess.student_id;
      const time = sess.time || '';
      const key = `${studentId}-${time}`;
      if (!seen.has(key)) {
        seen.add(key);
        entries.push({
          studentName: sess.students?.name || 'Unknown',
          studentId,
          time,
          source: 'adhoc',
          status: sess.status,
        });
      }
    }

    // Sort by time
    entries.sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      ok: true,
      data: { entries, isHoliday: isHolidayDate },
      message: `Schedule for ${dateParam} fetched successfully`,
    } satisfies ApiResponse);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to fetch day schedule',
        error: String(err),
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
