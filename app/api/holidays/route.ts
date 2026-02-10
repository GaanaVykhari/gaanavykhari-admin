import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Holiday, Student } from '@/types';
import { isSessionScheduledForDate, getTimeForDate } from '@/lib/schedule';
import { toLocalDateStr, parseLocalDate } from '@/lib/format';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .order('from_date', { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to fetch holidays',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Holidays fetched successfully',
      data: data || [],
    } satisfies ApiResponse<Holiday[]>);
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { from_date, to_date, description } = body;

    if (!from_date || !to_date) {
      return NextResponse.json(
        {
          ok: false,
          message: 'From date and to date are required',
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Create the holiday
    const { data: holiday, error } = await supabase
      .from('holidays')
      .insert({ from_date, to_date, description: description || null })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to create holiday',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // Cancel overlapping sessions already in DB
    await supabase
      .from('sessions')
      .update({
        status: 'canceled',
        canceled_reason: description || 'Holiday',
      })
      .eq('status', 'scheduled')
      .gte('date', from_date)
      .lte('date', to_date);

    // Create canceled session records for schedule-computed sessions
    const affectedStudents = await createCanceledSessionsForHoliday(
      supabase,
      from_date,
      to_date,
      description || 'Holiday'
    );

    return NextResponse.json(
      {
        ok: true,
        message: 'Holiday created successfully',
        data: {
          holiday,
          affectedStudents,
        },
      } satisfies ApiResponse,
      { status: 201 }
    );
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

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function createCanceledSessionsForHoliday(
  supabase: SupabaseClient,
  fromDate: string,
  toDate: string,
  reason: string
): Promise<{ id: string; name: string; phone: string }[]> {
  // Fetch all active students
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('is_active', true);

  if (!students || students.length === 0) {
    return [];
  }

  const affectedMap = new Map<
    string,
    { id: string; name: string; phone: string }
  >();

  // Collect all (studentId, date) pairs that need sessions
  const toCreate: {
    student_id: string;
    date: string;
    time: string;
    status: 'canceled';
    canceled_reason: string;
  }[] = [];

  const current = parseLocalDate(fromDate);
  const end = parseLocalDate(toDate);

  while (current <= end) {
    const dateStr = toLocalDateStr(current);

    for (const student of students as Student[]) {
      if (isSessionScheduledForDate(student, current, [])) {
        toCreate.push({
          student_id: student.id,
          date: dateStr,
          time: getTimeForDate(student, current),
          status: 'canceled',
          canceled_reason: reason,
        });
        affectedMap.set(student.id, {
          id: student.id,
          name: student.name,
          phone: student.phone,
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  if (toCreate.length === 0) {
    return [];
  }

  // Batch-fetch all existing sessions in the date range for affected students
  const affectedStudentIds = Array.from(affectedMap.keys());
  const { data: existingSessions } = await supabase
    .from('sessions')
    .select('student_id, date')
    .in('student_id', affectedStudentIds)
    .gte('date', fromDate)
    .lte('date', toDate);

  const existingSet = new Set(
    (existingSessions || []).map(s => `${s.student_id}:${s.date}`)
  );

  // Filter out sessions that already exist
  const newSessions = toCreate.filter(
    s => !existingSet.has(`${s.student_id}:${s.date}`)
  );

  // Batch-insert all new canceled sessions
  if (newSessions.length > 0) {
    await supabase.from('sessions').insert(newSessions);
  }

  return Array.from(affectedMap.values());
}
