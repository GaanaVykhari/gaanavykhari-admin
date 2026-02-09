export const DAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
] as const;

export const DAY_LABELS: Record<string, string> = {
  '0': 'Sun',
  '1': 'Mon',
  '2': 'Tue',
  '3': 'Wed',
  '4': 'Thu',
  '5': 'Fri',
  '6': 'Sat',
};

export const SESSION_STATUSES = [
  'scheduled',
  'attended',
  'canceled',
  'missed',
] as const;

export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'overdue',
  'cancelled',
] as const;

export const PAYMENT_METHODS = ['cash', 'upi', 'razorpay'] as const;
