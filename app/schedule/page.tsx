'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconClock, IconCheck, IconX } from '@tabler/icons-react';
import { SessionStatusBadge } from '@/components/common/StatusBadge';
import {
  formatTime,
  formatShortDate,
  getRelativeDateString,
} from '@/lib/format';
import type { ScheduleEntry, UpcomingSession } from '@/types';

export default function SchedulePage() {
  const [todaySchedule, setTodaySchedule] = useState<ScheduleEntry[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const [todayRes, upcomingRes] = await Promise.all([
        fetch('/api/schedule/today'),
        fetch('/api/schedule/upcoming?limit=10'),
      ]);
      const [todayData, upcomingData] = await Promise.all([
        todayRes.json(),
        upcomingRes.json(),
      ]);
      if (todayData.ok) {
        setTodaySchedule(todayData.data);
      }
      if (upcomingData.ok) {
        setUpcoming(upcomingData.data);
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
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
      loadSchedule();
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
        <Text c="dimmed">Loading schedule...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        Schedule
      </Title>

      {/* Today's Schedule */}
      <Title order={3} mb="md">
        Today&apos;s Classes
      </Title>
      {todaySchedule.length === 0 ? (
        <Card withBorder p="xl" mb="xl">
          <Stack align="center" gap="md">
            <IconCalendar size={48} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed">No classes scheduled for today</Text>
          </Stack>
        </Card>
      ) : (
        <Stack gap="md" mb="xl">
          {todaySchedule.map(entry => (
            <Card key={entry.student.id} withBorder padding="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group gap="md" mb="xs">
                    <Text fw={500} size="lg">
                      {entry.student.name}
                    </Text>
                    <SessionStatusBadge status={entry.status} />
                  </Group>
                  <Group gap="xs" c="dimmed">
                    <IconClock size={14} />
                    <Text size="sm">{formatTime(entry.time)}</Text>
                  </Group>
                </div>
              </Group>

              {entry.status === 'scheduled' && (
                <>
                  <Divider my="sm" />
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      leftSection={<IconCheck size={14} />}
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
                      size="xs"
                      variant="light"
                      color="yellow"
                      leftSection={<IconX size={14} />}
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
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() =>
                        handleStatusUpdate(
                          entry.student.id,
                          'missed',
                          entry.sessionId
                        )
                      }
                    >
                      Missed
                    </Button>
                  </Group>
                </>
              )}
            </Card>
          ))}
        </Stack>
      )}

      {/* Upcoming Sessions */}
      <Title order={3} mb="md">
        Upcoming Sessions
      </Title>
      {upcoming.length === 0 ? (
        <Card withBorder p="xl">
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
                  <Text size="sm" fw={500}>
                    {formatShortDate(session.date)}
                  </Text>
                  <Badge variant="light" size="sm">
                    {getRelativeDateString(session.date)}
                  </Badge>
                </div>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
