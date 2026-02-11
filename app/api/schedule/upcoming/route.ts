import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUpcomingSessions, getPaymentDueMap } from '@/lib/schedule';
import type { ApiResponse, UpcomingSession } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    if (!students) {
      return NextResponse.json({
        ok: true,
        message: 'No students found',
        data: [],
      } satisfies ApiResponse<UpcomingSession[]>);
    }

    const upcoming = await getUpcomingSessions(students, limit);

    // Get payment due status
    const studentIds = upcoming.map(u => u.student.id);
    const paymentMap = await getPaymentDueMap(studentIds);

    const upcomingWithPayment = upcoming.map(entry => ({
      ...entry,
      paymentStatus: paymentMap.get(entry.student.id)?.paymentStatus || 'none',
      classesSincePayment:
        paymentMap.get(entry.student.id)?.classesSincePayment || 0,
    }));

    return NextResponse.json({
      ok: true,
      message: 'Upcoming sessions fetched successfully',
      data: upcomingWithPayment,
    } satisfies ApiResponse<UpcomingSession[]>);
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
