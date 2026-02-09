import type { Student, SessionStatus } from './database';

export type {
  Student,
  Session,
  SessionWithStudent,
  Holiday,
  Payment,
  PaymentWithStudent,
  NotificationLog,
  ScheduleFrequency,
  SessionStatus,
  PaymentStatus,
  PaymentMethod,
  NotificationType,
  NotificationStatus,
} from './database';

export type { ApiResponse, PaginatedData } from './api';

export interface ScheduleEntry {
  student: Student;
  time: string;
  status: SessionStatus;
  sessionId?: string;
}

export interface UpcomingSession {
  student: Student;
  date: string;
  time: string;
  daysFromNow: number;
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
