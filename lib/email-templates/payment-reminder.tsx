import { formatShortDate, formatCurrency } from '@/lib/format';

interface PaymentReminderProps {
  studentName: string;
  amount: number;
  dueDate: string;
  paymentUrl?: string;
}

export function paymentReminderEmail({
  studentName,
  amount,
  dueDate,
  paymentUrl,
}: PaymentReminderProps): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Gaanavykhari</h2>
      <p>Hi ${studentName},</p>
      <p>This is a friendly reminder about your pending payment:</p>
      <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0;"><strong>Amount:</strong> ${formatCurrency(amount)}</p>
        <p style="margin: 8px 0 0;"><strong>Due Date:</strong> ${formatShortDate(dueDate)}</p>
      </div>
      ${
        paymentUrl
          ? `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${paymentUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Pay Now
        </a>
      </div>
      `
          : '<p>Please make the payment at your earliest convenience.</p>'
      }
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #888;">This is an automated message from Gaanavykhari.</p>
    </div>
  `;
}
