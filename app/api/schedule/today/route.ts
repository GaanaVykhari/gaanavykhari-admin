import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTodaysSchedule, getPaymentDueMap } from '@/lib/schedule';
import { toLocalDateStr } from '@/lib/format';
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
    const today = toLocalDateStr(new Date());
    const { data: existingSessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('date', today);

    // Get payment due status for all students in today's schedule
    const studentIds = schedule.map(e => e.student.id);
    const paymentMap = await getPaymentDueMap(studentIds);

    // Merge existing session statuses and payment info
    const mergedSchedule = schedule.map(entry => {
      const existing = existingSessions?.find(
        s => s.student_id === entry.student.id
      );
      const payment = paymentMap.get(entry.student.id);
      return {
        ...entry,
        ...(existing && { status: existing.status, sessionId: existing.id }),
        paymentStatus: payment?.paymentStatus || 'none',
        classesSincePayment: payment?.classesSincePayment || 0,
      };
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
