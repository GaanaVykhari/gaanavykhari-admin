import { formatShortDate, formatTime } from '@/lib/format';

interface SessionCancellationProps {
  studentName: string;
  date: string;
  time: string;
  reason?: string;
}

export function sessionCancellationEmail({
  studentName,
  date,
  time,
  reason,
}: SessionCancellationProps): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Gaanavykhari</h2>
      <p>Hi ${studentName},</p>
      <p>Your upcoming session has been canceled:</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Date:</strong> ${formatShortDate(date)}</p>
        <p style="margin: 8px 0 0;"><strong>Time:</strong> ${formatTime(time)}</p>
        ${reason ? `<p style="margin: 8px 0 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      <p>Please reach out if you have any questions.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #888;">This is an automated message from Gaanavykhari.</p>
    </div>
  `;
}
