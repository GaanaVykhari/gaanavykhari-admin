import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTodaysSchedule } from '@/lib/schedule';
import type { ApiResponse, ScheduleEntry } from '@/types';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    if (!students) {
      return NextResponse.json({
        ok: true,
        message: 'No students found',
        data: [],
      } satisfies ApiResponse<ScheduleEntry[]>);
    }

    const schedule = await getTodaysSchedule(students);

    // Check for existing sessions today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingSessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('date', today);

    // Merge existing session statuses
    const mergedSchedule = schedule.map(entry => {
      const existing = existingSessions?.find(
        s => s.student_id === entry.student.id
      );
      if (existing) {
        return {
          ...entry,
          status: existing.status,
          sessionId: existing.id,
        };
      }
      return entry;
    });

    return NextResponse.json({
      ok: true,
      message: "Today's schedule fetched successfully",
      data: mergedSchedule,
    } satisfies ApiResponse<ScheduleEntry[]>);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Internal server error',
        error: String(err),
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
