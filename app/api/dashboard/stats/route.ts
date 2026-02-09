import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, DashboardStats } from '@/types';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all counts in parallel
    const [
      studentsResult,
      activeStudentsResult,
      sessionsResult,
      attendedResult,
      paymentsResult,
      paidPaymentsResult,
      pendingPaymentsResult,
      overduePaymentsResult,
    ] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase.from('sessions').select('id', { count: 'exact', head: true }),
      supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'attended'),
      supabase.from('payments').select('amount').eq('status', 'paid'),
      supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte(
          'paid_date',
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).toISOString()
        ),
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'overdue'),
    ]);

    const totalStudents = studentsResult.count || 0;
    const activeStudents = activeStudentsResult.count || 0;
    const totalSessions = sessionsResult.count || 0;
    const attendedSessions = attendedResult.count || 0;
    const attendanceRate =
      totalSessions > 0
        ? Math.round((attendedSessions / totalSessions) * 100)
        : 0;

    const totalRevenue = (paymentsResult.data || []).reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const monthlyRevenue = (paidPaymentsResult.data || []).reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const stats: DashboardStats = {
      totalStudents,
      activeStudents,
      totalSessions,
      attendanceRate,
      totalRevenue,
      monthlyRevenue,
      pendingPayments: pendingPaymentsResult.count || 0,
      overduePayments: overduePaymentsResult.count || 0,
    };

    return NextResponse.json({
      ok: true,
      message: 'Dashboard stats fetched successfully',
      data: stats,
    } satisfies ApiResponse<DashboardStats>);
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
