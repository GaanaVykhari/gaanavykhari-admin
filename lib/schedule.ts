import type { Student, Holiday, ScheduleEntry, UpcomingSession } from '@/types';
import { createClient } from '@/lib/supabase/server';

export function isSessionScheduledForDate(
  student: Student,
  date: Date,
  holidays: Holiday[] = []
): boolean {
  const induction = new Date(student.induction_date);
  induction.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  if (checkDate < induction) {
    return false;
  }

  if (!student.is_active) {
    return false;
  }

  const dateStr = checkDate.toISOString().split('T')[0]!;
  if (
    holidays.some(h => {
      return dateStr >= h.from_date && dateStr <= h.to_date;
    })
  ) {
    return false;
  }

  const dayOfWeek = checkDate.getDay();
  return String(dayOfWeek) in student.schedule;
}

export function getTimeForDate(student: Student, date: Date): string {
  const dayOfWeek = date.getDay();
  return student.schedule[String(dayOfWeek)] || '09:00';
}

export function getNextSessionDate(
  student: Student,
  fromDate: Date = new Date(),
  holidays: Holiday[] = []
): Date | null {
  if (!student.is_active || Object.keys(student.schedule).length === 0) {
    return null;
  }

  const current = new Date(fromDate);
  current.setHours(0, 0, 0, 0);

  // Look ahead up to 60 days
  for (let i = 1; i <= 60; i++) {
    const checkDate = new Date(current);
    checkDate.setDate(checkDate.getDate() + i);

    if (isSessionScheduledForDate(student, checkDate, holidays)) {
      return checkDate;
    }
  }

  return null;
}

export async function getHolidays(): Promise<Holiday[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('holidays')
    .select('*')
    .order('from_date', { ascending: true });
  return data || [];
}

export async function getTodaysSchedule(
  students: Student[]
): Promise<ScheduleEntry[]> {
  const today = new Date();
  const holidays = await getHolidays();
  const todaysSchedule: ScheduleEntry[] = [];

  for (const student of students) {
    if (isSessionScheduledForDate(student, today, holidays)) {
      todaysSchedule.push({
        student,
        time: getTimeForDate(student, today),
        status: 'scheduled',
      });
    }
  }

  return todaysSchedule.sort((a, b) => a.time.localeCompare(b.time));
}

export async function getUpcomingSessions(
  students: Student[],
  limit: number = 5
): Promise<UpcomingSession[]> {
  const today = new Date();
  const holidays = await getHolidays();
  const upcomingSessions: UpcomingSession[] = [];

  for (const student of students) {
    const nextSessionDate = getNextSessionDate(student, today, holidays);
    if (nextSessionDate) {
      const daysFromNow = Math.ceil(
        (nextSessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      upcomingSessions.push({
        student,
        date: nextSessionDate.toISOString().split('T')[0]!,
        time: getTimeForDate(student, nextSessionDate),
        daysFromNow,
      });
    }
  }

  return upcomingSessions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}
