import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaymentLink } from '@/lib/razorpay';
import type { ApiResponse } from '@/types';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch the payment with student info
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*, students!inner(id, name, email, phone)')
      .eq('id', id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json(
        { ok: false, message: 'Payment not found' } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const student = payment.students as {
      id: string;
      name: string;
      email: string;
      phone: string;
    };

    // Create Razorpay payment link
    const link = await createPaymentLink({
      amount: payment.amount,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      description: `Fee payment - ${student.name}`,
      dueDate: payment.due_date,
    });

    // Update payment with Razorpay link info
    await supabase
      .from('payments')
      .update({
        razorpay_link_id: link.id,
        razorpay_link_url: link.short_url,
      })
      .eq('id', id);

    return NextResponse.json({
      ok: true,
      message: 'Payment link created successfully',
      data: { link_url: link.short_url },
    } satisfies ApiResponse);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to create payment link',
        error: String(err),
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
