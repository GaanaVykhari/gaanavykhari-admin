import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface CreatePaymentLinkParams {
  amount: number; // in INR (will be converted to paisa)
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  description: string;
  dueDate?: string; // ISO date string
}

export async function createPaymentLink({
  amount,
  studentName,
  studentEmail,
  studentPhone,
  description,
  dueDate,
}: CreatePaymentLinkParams): Promise<{
  id: string;
  short_url: string;
}> {
  const options: Record<string, unknown> = {
    amount: amount * 100, // Convert to paisa
    currency: 'INR',
    description,
    customer: {
      name: studentName,
      email: studentEmail,
      contact: studentPhone,
    },
    notify: {
      sms: true,
      email: true,
    },
    reminder_enable: true,
    callback_method: 'get',
  };

  if (dueDate) {
    options.expire_by = Math.floor(new Date(dueDate).getTime() / 1000);
  }

  const link = await (razorpay as any).paymentLink.create(options);
  return { id: link.id, short_url: link.short_url };
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}
