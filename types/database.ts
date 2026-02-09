export type SessionStatus = 'scheduled' | 'attended' | 'canceled' | 'missed';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export type PaymentMethod = 'cash' | 'upi' | 'razorpay';

// Map of day number (0=Sun, 1=Mon, ..., 6=Sat) to time string (HH:MM)
export type WeeklySchedule = Record<string, string>;

export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  fee_per_classes: number;
  fee_amount: number;
  schedule: WeeklySchedule;
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
  created_at: string;
  updated_at: string;
}

export interface PaymentWithStudent extends Payment {
  students: Pick<Student, 'id' | 'name' | 'email' | 'phone'>;
}
