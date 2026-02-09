import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = createAdminClient();

    if (event.event === 'payment_link.paid') {
      const paymentLinkId = event.payload?.payment_link?.entity?.id;
      const razorpayPaymentId = event.payload?.payment?.entity?.id;

      if (paymentLinkId) {
        await supabase
          .from('payments')
          .update({
            status: 'paid',
            payment_method: 'razorpay',
            paid_date: new Date().toISOString(),
            razorpay_payment_id: razorpayPaymentId || null,
          })
          .eq('razorpay_link_id', paymentLinkId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
