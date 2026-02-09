import { formatShortDate } from '@/lib/format';

interface HolidayNotificationProps {
  studentName: string;
  fromDate: string;
  toDate: string;
  description: string;
}

export function holidayNotificationEmail({
  studentName,
  fromDate,
  toDate,
  description,
}: HolidayNotificationProps): string {
  const dateRange =
    fromDate === toDate
      ? formatShortDate(fromDate)
      : `${formatShortDate(fromDate)} to ${formatShortDate(toDate)}`;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Gaanavykhari</h2>
      <p>Hi ${studentName},</p>
      <p>This is to inform you that classes have been canceled for the following period:</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Date:</strong> ${dateRange}</p>
        <p style="margin: 8px 0 0;"><strong>Reason:</strong> ${description}</p>
      </div>
      <p>Your scheduled sessions during this period have been automatically canceled.</p>
      <p>Thank you for your understanding!</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #888;">This is an automated message from Gaanavykhari.</p>
    </div>
  `;
}
