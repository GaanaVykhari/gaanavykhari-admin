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
  const dayOfMonth = checkDate.getDate();

  switch (student.schedule_frequency) {
    case 'daily':
      return true;

    case 'weekly':
      return student.schedule_days_of_week.includes(dayOfWeek);

    case 'fortnightly':
      if (!student.schedule_days_of_week.includes(dayOfWeek)) {
        return false;
      }
      const weeksSinceInduction = Math.floor(
        (checkDate.getTime() - induction.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      return weeksSinceInduction % 2 === 0;

    case 'monthly':
      return student.schedule_days_of_month.includes(dayOfMonth);

    default:
      return false;
  }
}

export function getNextSessionDate(
  student: Student,
  fromDate: Date = new Date(),
  holidays: Holiday[] = []
): Date | null {
  const induction = new Date(student.induction_date);
  const current = new Date(fromDate);

  const startDate = new Date(Math.max(induction.getTime(), current.getTime()));

  let nextDate: Date | null = null;

  switch (student.schedule_frequency) {
    case 'daily':
      nextDate = addDays(startDate, 1);
      break;
    case 'weekly':
      nextDate = getNextWeeklySession(startDate, student.schedule_days_of_week);
      break;
    case 'fortnightly':
      nextDate = getNextFortnightlySession(
        startDate,
        student.schedule_days_of_week,
        induction
      );
      break;
    case 'monthly':
      nextDate = getNextMonthlySession(
        startDate,
        student.schedule_days_of_month
      );
      break;
    default:
      return null;
  }

  if (nextDate) {
    const dateStr = nextDate.toISOString().split('T')[0]!;
    if (holidays.some(h => dateStr >= h.from_date && dateStr <= h.to_date)) {
      return getNextSessionDate(student, addDays(nextDate, 1), holidays);
    }
  }

  return nextDate;
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
        time: student.schedule_time,
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
        time: student.schedule_time,
        daysFromNow,
      });
    }
  }

  return upcomingSessions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}

// Helper functions
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getNextWeeklySession(
  fromDate: Date,
  daysOfWeek: number[]
): Date | null {
  if (daysOfWeek.length === 0) {
    return null;
  }

  const today = fromDate.getDay();
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

  for (const day of sortedDays) {
    if (day > today) {
      const nextDate = new Date(fromDate);
      nextDate.setDate(nextDate.getDate() + (day - today));
      return nextDate;
    }
  }

  const firstDayNextWeek = sortedDays[0];
  if (firstDayNextWeek === undefined) {
    return null;
  }
  const daysUntilNextWeek = 7 - today + firstDayNextWeek;
  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + daysUntilNextWeek);
  return nextDate;
}

function getNextFortnightlySession(
  fromDate: Date,
  daysOfWeek: number[],
  inductionDate: Date
): Date | null {
  if (daysOfWeek.length === 0) {
    return null;
  }

  const weeksSinceInduction = Math.floor(
    (fromDate.getTime() - inductionDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const isCurrentWeekScheduled = weeksSinceInduction % 2 === 0;

  if (isCurrentWeekScheduled) {
    const nextInCurrentWeek = getNextWeeklySession(fromDate, daysOfWeek);
    if (nextInCurrentWeek && isSameWeek(nextInCurrentWeek, fromDate)) {
      return nextInCurrentWeek;
    }
  }

  const nextScheduledWeek = new Date(fromDate);
  nextScheduledWeek.setDate(
    nextScheduledWeek.getDate() + (isCurrentWeekScheduled ? 14 : 7)
  );

  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
  const firstDayOfWeek = sortedDays[0];
  if (firstDayOfWeek === undefined) {
    return null;
  }

  const startOfWeek = new Date(nextScheduledWeek);
  startOfWeek.setDate(
    startOfWeek.getDate() - startOfWeek.getDay() + firstDayOfWeek
  );
  return startOfWeek;
}

function getNextMonthlySession(
  fromDate: Date,
  daysOfMonth: number[]
): Date | null {
  if (daysOfMonth.length === 0) {
    return null;
  }

  const currentDay = fromDate.getDate();
  const sortedDays = [...daysOfMonth].sort((a, b) => a - b);

  for (const day of sortedDays) {
    if (day > currentDay) {
      const nextDate = new Date(fromDate);
      nextDate.setDate(day);
      return nextDate;
    }
  }

  const firstDayNextMonth = sortedDays[0];
  if (firstDayNextMonth === undefined) {
    return null;
  }
  const nextDate = new Date(fromDate);
  nextDate.setMonth(nextDate.getMonth() + 1, firstDayNextMonth);
  return nextDate;
}

function isSameWeek(date1: Date, date2: Date): boolean {
  const startOfWeek1 = new Date(date1);
  startOfWeek1.setDate(startOfWeek1.getDate() - startOfWeek1.getDay());
  startOfWeek1.setHours(0, 0, 0, 0);

  const startOfWeek2 = new Date(date2);
  startOfWeek2.setDate(startOfWeek2.getDate() - startOfWeek2.getDay());
  startOfWeek2.setHours(0, 0, 0, 0);

  return startOfWeek1.getTime() === startOfWeek2.getTime();
}
