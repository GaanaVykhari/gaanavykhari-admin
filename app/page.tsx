'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Anchor,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUsers,
  IconCalendar,
  IconCreditCard,
  IconChartBar,
  IconClock,
  IconPlus,
  IconCheck,
  IconX,
  IconCalendarEvent,
  IconAlertTriangle,
  IconBrandWhatsapp,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { StatsCard } from '@/components/common/StatsCard';
import {
  StatsCardsSkeleton,
  ScheduleCardSkeleton,
} from '@/components/common/Skeletons';
import {
  SessionStatusBadge,
  PaymentBadge,
} from '@/components/common/StatusBadge';
import { HolidayModal } from '@/components/holidays/HolidayModal';
import { HolidayList } from '@/components/holidays/HolidayList';
import { CancelRescheduleModal } from '@/components/sessions/CancelRescheduleModal';
import {
  formatTime,
  formatShortDate,
  formatCurrency,
  getRelativeDateString,
  toLocalDateStr,
} from '@/lib/format';
import { getWhatsAppUrl, getCancellationMessage } from '@/lib/whatsapp';
import type {
  DashboardStats,
  ScheduleEntry,
  UpcomingSession,
  Holiday,
} from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleEntry[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [todayLoading, setTodayLoading] = useState(true);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [
    holidayModalOpened,
    { open: openHolidayModal, close: closeHolidayModal },
  ] = useDisclosure(false);
  const [cancelTarget, setCancelTarget] = useState<{
    studentName: string;
    studentPhone: string;
    studentId: string;
    date: string;
    time: string;
  } | null>(null);

  const loadDashboard = useCallback(async () => {
    setStatsLoading(true);
    setTodayLoading(true);
    setUpcomingLoading(true);
    setHolidaysLoading(true);

    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setStats(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    fetch('/api/schedule/today')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setTodaySchedule(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setTodayLoading(false));

    fetch('/api/schedule/upcoming?limit=5')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setUpcoming(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setUpcomingLoading(false));

    fetch('/api/holidays')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setHolidays(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setHolidaysLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleStatusUpdate = async (
    studentId: string,
    status: string,
    sessionId?: string
  ) => {
    try {
      if (sessionId) {
        await fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      } else {
        const today = toLocalDateStr(new Date());
        const entry = todaySchedule.find(e => e.student.id === studentId);
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            date: today,
            time: entry?.time || '09:00',
            status,
          }),
        });
      }
      notifications.show({
        title: 'Updated',
        message: `Session marked as ${status}`,
        color: 'green',
      });

      // Open WhatsApp with cancellation message
      if (status === 'canceled') {
        const entry = todaySchedule.find(e => e.student.id === studentId);
        if (entry) {
          const today = toLocalDateStr(new Date());
          const msg = getCancellationMessage(
            entry.student.name,
            today,
            entry.time
          );
          window.open(getWhatsAppUrl(entry.student.phone, msg), '_blank');
        }
      }

      loadDashboard();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to update session',
        color: 'red',
      });
    }
  };

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        Dashboard
      </Title>

      {/* Stats Cards */}
      {statsLoading ? (
        <StatsCardsSkeleton />
      ) : stats ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
          <StatsCard
            title="Active Students"
            value={stats.activeStudents}
            icon={IconUsers}
            color="blue"
            description={`${stats.totalStudents} total`}
          />
          <StatsCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={IconChartBar}
            color="green"
            description={`${stats.totalSessions} total sessions`}
          />
          <StatsCard
            title="Monthly Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            icon={IconCreditCard}
            color="violet"
            description={`${formatCurrency(stats.totalRevenue)} total`}
          />
          <StatsCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={IconAlertTriangle}
            color={stats.overduePayments > 0 ? 'red' : 'yellow'}
            description={
              stats.overduePayments > 0
                ? `${stats.overduePayments} overdue`
                : undefined
            }
          />
        </SimpleGrid>
      ) : null}

      {/* Quick Actions */}
      <Group mb="xl" gap="sm">
        <Button
          leftSection={<IconPlus size={16} />}
          size="sm"
          onClick={() => router.push('/students?action=add')}
        >
          Add Student
        </Button>
        <Button
          leftSection={<IconCreditCard size={16} />}
          size="sm"
          variant="light"
          onClick={() => router.push('/payments?action=add')}
        >
          Record Payment
        </Button>
        <Button
          leftSection={<IconCalendarEvent size={16} />}
          size="sm"
          variant="light"
          color="red"
          onClick={openHolidayModal}
        >
          Schedule Holiday
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Today's Classes */}
        <div>
          <Title order={3} mb="md">
            Today&apos;s Classes
          </Title>
          {todayLoading ? (
            <ScheduleCardSkeleton count={2} />
          ) : todaySchedule.length === 0 ? (
            <Card withBorder p="lg">
              <Text c="dimmed" ta="center">
                No classes today
              </Text>
            </Card>
          ) : (
            <Stack gap="sm">
              {todaySchedule.map(entry => (
                <Card key={entry.student.id} withBorder padding="sm">
                  <Group justify="space-between" mb="xs">
                    <div>
                      <Group gap="xs">
                        <Anchor
                          fw={500}
                          href={`/students/${entry.student.id}`}
                          underline="hover"
                          c="var(--mantine-color-text)"
                        >
                          {entry.student.name}
                        </Anchor>
                        <PaymentBadge
                          status={entry.paymentStatus}
                          count={entry.classesSincePayment}
                          total={entry.student.fee_per_classes}
                        />
                      </Group>
                      <Group gap="xs" c="dimmed">
                        <IconClock size={14} />
                        <Text size="sm">{formatTime(entry.time)}</Text>
                      </Group>
                    </div>
                    <SessionStatusBadge status={entry.status} />
                  </Group>
                  {entry.status === 'scheduled' && (
                    <Group gap="xs" mt="xs">
                      <Button
                        size="compact-xs"
                        variant="light"
                        color="green"
                        leftSection={<IconCheck size={12} />}
                        onClick={() =>
                          handleStatusUpdate(
                            entry.student.id,
                            'attended',
                            entry.sessionId
                          )
                        }
                      >
                        Attended
                      </Button>
                      <Button
                        size="compact-xs"
                        variant="light"
                        color="yellow"
                        leftSection={<IconX size={12} />}
                        onClick={() =>
                          setCancelTarget({
                            studentName: entry.student.name,
                            studentPhone: entry.student.phone,
                            studentId: entry.student.id,
                            date: toLocalDateStr(new Date()),
                            time: entry.time,
                          })
                        }
                      >
                        Cancel
                      </Button>
                    </Group>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div>
          <Title order={3} mb="md">
            Upcoming Sessions
          </Title>
          {upcomingLoading ? (
            <ScheduleCardSkeleton count={3} />
          ) : upcoming.length === 0 ? (
            <Card withBorder p="lg">
              <Text c="dimmed" ta="center">
                No upcoming sessions
              </Text>
            </Card>
          ) : (
            <Stack gap="sm">
              {upcoming.map((session, index) => (
                <Card
                  key={`${session.student.id}-${index}`}
                  withBorder
                  padding="sm"
                >
                  <Group justify="space-between">
                    <div>
                      <Group gap="xs">
                        <Anchor
                          fw={500}
                          href={`/students/${session.student.id}`}
                          underline="hover"
                          c="var(--mantine-color-text)"
                        >
                          {session.student.name}
                        </Anchor>
                        <PaymentBadge
                          status={session.paymentStatus}
                          count={session.classesSincePayment}
                          total={session.student.fee_per_classes}
                        />
                      </Group>
                      <Group gap="xs" c="dimmed">
                        <IconClock size={14} />
                        <Text size="sm">{formatTime(session.time)}</Text>
                      </Group>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text size="sm">{formatShortDate(session.date)}</Text>
                      <Group gap="xs" justify="flex-end">
                        <Button
                          size="compact-xs"
                          variant="light"
                          color="yellow"
                          leftSection={<IconX size={12} />}
                          onClick={() =>
                            setCancelTarget({
                              studentName: session.student.name,
                              studentPhone: session.student.phone,
                              studentId: session.student.id,
                              date: session.date,
                              time: session.time,
                            })
                          }
                        >
                          Cancel
                        </Button>
                        <Badge variant="light" size="sm">
                          {getRelativeDateString(session.date)}
                        </Badge>
                      </Group>
                    </div>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </div>
      </SimpleGrid>

      {/* Holidays */}
      <Title order={3} mt="xl" mb="md">
        Holidays
      </Title>
      <HolidayList holidays={holidays} onHolidayDeleted={loadDashboard} />

      <HolidayModal
        opened={holidayModalOpened}
        onClose={closeHolidayModal}
        onHolidayCreated={loadDashboard}
      />

      {cancelTarget && (
        <CancelRescheduleModal
          opened={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          studentName={cancelTarget.studentName}
          studentPhone={cancelTarget.studentPhone}
          studentId={cancelTarget.studentId}
          date={cancelTarget.date}
          time={cancelTarget.time}
          onCompleted={loadDashboard}
        />
      )}
    </Container>
  );
}
