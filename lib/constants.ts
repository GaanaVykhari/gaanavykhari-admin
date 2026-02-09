export const SCHEDULE_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

export const DAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
] as const;

export const MONTH_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

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
