import type { Student, SessionStatus } from './database';

export type {
  Student,
  Session,
  SessionWithStudent,
  Holiday,
  Payment,
  PaymentWithStudent,
  WeeklySchedule,
  SessionStatus,
  PaymentStatus,
  PaymentMethod,
} from './database';

export type { ApiResponse, PaginatedData } from './api';

export type PaymentIndicator = 'none' | 'due' | 'overdue';

export interface ScheduleEntry {
  student: Student;
  time: string;
  status: SessionStatus;
  sessionId?: string;
  paymentStatus?: PaymentIndicator;
  classesSincePayment?: number;
}

export interface UpcomingSession {
  student: Student;
  date: string;
  time: string;
  daysFromNow: number;
  paymentStatus?: PaymentIndicator;
  classesSincePayment?: number;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalSessions: number;
  attendanceRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
}
