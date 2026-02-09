'use client';

import { useState, useEffect } from 'react';
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
  Divider,
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
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { StatsCard } from '@/components/common/StatsCard';
import { SessionStatusBadge } from '@/components/common/StatusBadge';
import { HolidayModal } from '@/components/holidays/HolidayModal';
import { HolidayList } from '@/components/holidays/HolidayList';
import {
  formatTime,
  formatShortDate,
  formatCurrency,
  getRelativeDateString,
} from '@/lib/format';
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
  const [loading, setLoading] = useState(true);
  const [
    holidayModalOpened,
    { open: openHolidayModal, close: closeHolidayModal },
  ] = useDisclosure(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, todayRes, upcomingRes, holidaysRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/schedule/today'),
        fetch('/api/schedule/upcoming?limit=5'),
        fetch('/api/holidays'),
      ]);
      const [statsData, todayData, upcomingData, holidaysData] =
        await Promise.all([
          statsRes.json(),
          todayRes.json(),
          upcomingRes.json(),
          holidaysRes.json(),
        ]);

      if (statsData.ok) {
        setStats(statsData.data);
      }
      if (todayData.ok) {
        setTodaySchedule(todayData.data);
      }
      if (upcomingData.ok) {
        setUpcoming(upcomingData.data);
      }
      if (holidaysData.ok) {
        setHolidays(holidaysData.data);
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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
        const today = new Date().toISOString().split('T')[0];
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
      loadDashboard();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to update session',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="md">
        <Text c="dimmed">Loading dashboard...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        Dashboard
      </Title>

      {/* Stats Cards */}
      {stats && (
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
      )}

      {/* Quick Actions */}
      <Group mb="xl" gap="sm">
        <Button
          leftSection={<IconPlus size={16} />}
          size="sm"
          onClick={() => router.push('/students')}
        >
          Add Student
        </Button>
        <Button
          leftSection={<IconCreditCard size={16} />}
          size="sm"
          variant="light"
          onClick={() => router.push('/payments')}
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
          {todaySchedule.length === 0 ? (
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
                      <Text fw={500}>{entry.student.name}</Text>
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
                          handleStatusUpdate(
                            entry.student.id,
                            'canceled',
                            entry.sessionId
                          )
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
          {upcoming.length === 0 ? (
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
                      <Text fw={500}>{session.student.name}</Text>
                      <Group gap="xs" c="dimmed">
                        <IconClock size={14} />
                        <Text size="sm">{formatTime(session.time)}</Text>
                      </Group>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text size="sm">{formatShortDate(session.date)}</Text>
                      <Badge variant="light" size="sm">
                        {getRelativeDateString(session.date)}
                      </Badge>
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
    </Container>
  );
}
