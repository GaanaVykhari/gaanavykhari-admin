export type ScheduleFrequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly';

export type SessionStatus = 'scheduled' | 'attended' | 'canceled' | 'missed';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export type PaymentMethod = 'cash' | 'upi' | 'razorpay';

export type NotificationType =
  | 'holiday_notification'
  | 'session_cancellation'
  | 'payment_link'
  | 'payment_reminder';

export type NotificationStatus = 'sent' | 'failed';

export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  fee_per_classes: number;
  fee_amount: number;
  schedule_frequency: ScheduleFrequency;
  schedule_days_of_week: number[];
  schedule_days_of_month: number[];
  schedule_time: string;
  induction_date: string;
  last_class_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  student_id: string;
  date: string;
  time: string;
  status: SessionStatus;
  notes: string | null;
  canceled_reason: string | null;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionWithStudent extends Session {
  students: Pick<Student, 'id' | 'name' | 'email' | 'phone'>;
}

export interface Holiday {
  id: string;
  from_date: string;
  to_date: string;
  description: string | null;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  payment_method: PaymentMethod | null;
  paid_date: string | null;
  razorpay_link_id: string | null;
  razorpay_link_url: string | null;
  razorpay_payment_id: string | null;
  notes: string | null;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentWithStudent extends Payment {
  students: Pick<Student, 'id' | 'name' | 'email' | 'phone'>;
}

export interface NotificationLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  type: NotificationType;
  reference_id: string | null;
  status: NotificationStatus;
  error_message: string | null;
  sent_at: string;
}
