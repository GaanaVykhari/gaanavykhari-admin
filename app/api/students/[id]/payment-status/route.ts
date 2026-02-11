import { NextRequest, NextResponse } from 'next/server';
import { getPaymentDueMap } from '@/lib/schedule';
import type { ApiResponse, PaymentIndicator } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const map = await getPaymentDueMap([id]);
    const data = map.get(id) || {
      paymentStatus: 'none' as PaymentIndicator,
      classesSincePayment: 0,
    };

    return NextResponse.json({
      ok: true,
      message: 'Payment status fetched',
      data,
    } satisfies ApiResponse<{
      paymentStatus: PaymentIndicator;
      classesSincePayment: number;
    }>);
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
