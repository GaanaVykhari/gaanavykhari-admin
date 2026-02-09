import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { holidayNotificationEmail } from '@/lib/email-templates/holiday-notification';
import type { ApiResponse, Holiday } from '@/types';

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

    // Cancel overlapping sessions
    const { data: canceledSessions } = await supabase
      .from('sessions')
      .update({
        status: 'canceled',
        canceled_reason: description || 'Holiday',
      })
      .eq('status', 'scheduled')
      .gte('date', from_date)
      .lte('date', to_date)
      .select('*, students!inner(id, name, email)');

    // Send email notifications (non-blocking)
    if (canceledSessions && canceledSessions.length > 0) {
      const notifiedStudents = new Set<string>();
      for (const session of canceledSessions) {
        const studentEmail = session.students?.email;
        const studentName = session.students?.name;
        if (studentEmail && !notifiedStudents.has(studentEmail)) {
          notifiedStudents.add(studentEmail);
          sendEmail({
            to: studentEmail,
            subject: `Class Canceled - ${description || 'Holiday'}`,
            html: holidayNotificationEmail({
              studentName: studentName || 'Student',
              fromDate: from_date,
              toDate: to_date,
              description: description || 'Holiday',
            }),
          }).then(async result => {
            // Log notification
            await supabase.from('notification_log').insert({
              recipient_email: studentEmail,
              recipient_name: studentName || '',
              subject: `Class Canceled - ${description || 'Holiday'}`,
              type: 'holiday_notification',
              reference_id: holiday.id,
              status: result.success ? 'sent' : 'failed',
              error_message: result.error || null,
            });
          });
        }
      }
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Holiday created successfully',
        data: holiday,
      } satisfies ApiResponse<Holiday>,
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
