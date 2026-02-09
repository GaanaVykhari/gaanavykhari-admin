import { formatTime, formatShortDate } from './format';

function cleanPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const clean = cleanPhone(phone);
  const base = `https://wa.me/${clean}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

export function getCancellationMessage(
  studentName: string,
  date: string,
  time: string
): string {
  return (
    `Hi ${studentName},\n\n` +
    `This is to inform you that your music class scheduled for ` +
    `${formatShortDate(date)} at ${formatTime(time)} has been cancelled.\n\n` +
    `We will resume as per the regular schedule.\n\n` +
    `- GaanaVykhari`
  );
}

export function getHolidayMessage(
  fromDate: string,
  toDate: string,
  description?: string
): string {
  const isSingleDay = fromDate === toDate;
  const dateRange = isSingleDay
    ? formatShortDate(fromDate)
    : `${formatShortDate(fromDate)} to ${formatShortDate(toDate)}`;
  const reason = description ? ` due to ${description}` : '';

  return (
    `Hi,\n\n` +
    `This is to inform you that there will be no music classes ` +
    `on ${dateRange}${reason}.\n\n` +
    `Classes will resume as per the regular schedule after the holiday.\n\n` +
    `- GaanaVykhari`
  );
}
