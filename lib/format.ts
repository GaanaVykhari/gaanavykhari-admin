export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    if (!hours || !minutes) {
      return time;
    }
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return time;
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateRange(
  from: Date | string,
  to: Date | string
): string {
  const fromDate = typeof from === 'string' ? new Date(from) : from;
  const toDate = typeof to === 'string' ? new Date(to) : to;

  if (fromDate.toDateString() === toDate.toDateString()) {
    return formatShortDate(fromDate);
  }

  return `${formatShortDate(fromDate)} - ${formatShortDate(toDate)}`;
}

export function getRelativeDateString(date: Date | string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffInDays = Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return 'Today';
  }
  if (diffInDays === 1) {
    return 'Tomorrow';
  }
  if (diffInDays === -1) {
    return 'Yesterday';
  }
  if (diffInDays > 0) {
    return `In ${diffInDays} days`;
  }
  return `${Math.abs(diffInDays)} days ago`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
