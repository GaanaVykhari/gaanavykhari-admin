'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Stack,
  Group,
  Text,
  Button,
  Card,
  ActionIcon,
  Divider,
  Badge,
  Modal,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCalendar,
  IconClock,
  IconTrash,
  IconPlus,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { SessionStatusBadge } from '@/components/common/StatusBadge';
import { formatTime } from '@/lib/format';
import { DAY_LABELS } from '@/lib/constants';
import type { Student, Holiday, SessionStatus } from '@/types';

interface SessionData {
  id: string;
  student_id: string;
  date: string;
  time: string;
  status: SessionStatus;
  notes: string | null;
  students?: { id: string; name: string; email: string; phone: string };
}

interface UpcomingEntry {
  date: string;
  time: string;
  dayLabel: string;
  isToday: boolean;
  existingSession?: SessionData;
}

interface SessionManagerProps {
  studentId?: string;
  student?: Student;
  onSessionUpdated?: () => void;
}

function getUpcomingDates(
  student: Student,
  holidays: Holiday[],
  count: number
): UpcomingEntry[] {
  const entries: UpcomingEntry[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0]!;

  const induction = new Date(student.induction_date);
  induction.setHours(0, 0, 0, 0);

  for (let i = 0; entries.length < count && i <= 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);

    if (d < induction) {
      continue;
    }

    const dayOfWeek = String(d.getDay());
    const time = student.schedule[dayOfWeek];
    if (!time) {
      continue;
    }

    const dateStr = d.toISOString().split('T')[0]!;
    const isHoliday = holidays.some(
      h => dateStr >= h.from_date && dateStr <= h.to_date
    );
    if (isHoliday) {
      continue;
    }

    entries.push({
      date: dateStr,
      time,
      dayLabel: DAY_LABELS[dayOfWeek] || dayOfWeek,
      isToday: dateStr === todayStr,
    });
  }

  return entries;
}

export default function SessionManager({
  studentId,
  student,
  onSessionUpdated,
}: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);

  const [formData, setFormData] = useState({
    student_id: studentId || '',
    date: new Date().toISOString().split('T')[0] || '',
    time: '09:00',
    notes: '',
  });

  const loadSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (studentId) {
        params.set('studentId', studentId);
      }
      params.set('limit', '50');

      const response = await fetch(`/api/sessions?${params.toString()}`);
      const data = await response.json();
      if (data.ok) {
        setSessions(data.data || []);
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const loadHolidays = async () => {
    try {
      const response = await fetch('/api/holidays');
      const data = await response.json();
      if (data.ok) {
        setHolidays(data.data || []);
      }
    } catch {
      // Error handled silently
    }
  };

  useEffect(() => {
    loadSessions();
    loadHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const upcoming = useMemo(() => {
    if (!student || !student.is_active) {
      return [];
    }
    const entries = getUpcomingDates(student, holidays, 10);
    // Merge with existing DB sessions
    const sessionsByDate = new Map<string, SessionData>();
    for (const s of sessions) {
      sessionsByDate.set(s.date, s);
    }
    return entries.map(entry => ({
      ...entry,
      existingSession: sessionsByDate.get(entry.date),
    }));
  }, [student, holidays, sessions]);

  const pastSessions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]!;
    const upcomingDates = new Set(upcoming.map(u => u.date));
    return sessions.filter(
      s =>
        s.date < todayStr || (!upcomingDates.has(s.date) && s.date <= todayStr)
    );
  }, [sessions, upcoming]);

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.ok) {
        closeAddModal();
        setFormData({
          student_id: studentId || '',
          date: new Date().toISOString().split('T')[0] || '',
          time: '09:00',
          notes: '',
        });
        loadSessions();
        onSessionUpdated?.();
        notifications.show({
          title: 'Success',
          message: 'Session added',
          color: 'green',
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to add session',
        color: 'red',
      });
    }
  };

  const handleQuickRecord = async (
    date: string,
    time: string,
    status: SessionStatus
  ) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          date,
          time,
          status,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        loadSessions();
        onSessionUpdated?.();
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to record session',
        color: 'red',
      });
    }
  };

  const handleStatusUpdate = async (sessionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadSessions();
        onSessionUpdated?.();
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to update session',
        color: 'red',
      });
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadSessions();
        onSessionUpdated?.();
        notifications.show({
          title: 'Deleted',
          message: 'Session deleted',
          color: 'green',
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete session',
        color: 'red',
      });
    }
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Text fw={500} size="lg">
          Sessions
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openAddModal}
          size="sm"
        >
          Add Session
        </Button>
      </Group>

      {loading ? (
        <Text c="dimmed" ta="center" py="xl">
          Loading sessions...
        </Text>
      ) : (
        <Stack gap="md">
          {/* Upcoming scheduled sessions */}
          {upcoming.length > 0 && (
            <>
              <Text size="sm" c="dimmed" fw={500}>
                Upcoming
              </Text>
              {upcoming.map(entry => {
                const existing = entry.existingSession;
                return (
                  <Card
                    key={entry.date}
                    withBorder
                    padding="md"
                    bg={
                      entry.isToday
                        ? 'var(--mantine-color-blue-light)'
                        : undefined
                    }
                  >
                    <Group justify="space-between" align="flex-start">
                      <div style={{ flex: 1 }}>
                        <Group gap="md" mb="xs">
                          <Text fw={500}>
                            {entry.dayLabel},{' '}
                            {format(
                              new Date(entry.date + 'T00:00:00'),
                              'MMM dd'
                            )}
                          </Text>
                          {entry.isToday && (
                            <Badge color="blue" variant="filled" size="sm">
                              Today
                            </Badge>
                          )}
                          {existing && (
                            <SessionStatusBadge status={existing.status} />
                          )}
                        </Group>
                        <Group c="dimmed" gap="xs">
                          <IconClock size={14} />
                          <Text size="sm">{formatTime(entry.time)}</Text>
                        </Group>
                      </div>
                    </Group>

                    {!existing && (
                      <>
                        <Divider my="sm" />
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            onClick={() =>
                              handleQuickRecord(
                                entry.date,
                                entry.time,
                                'attended'
                              )
                            }
                          >
                            Mark Attended
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            color="yellow"
                            onClick={() =>
                              handleQuickRecord(
                                entry.date,
                                entry.time,
                                'canceled'
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
                              handleQuickRecord(
                                entry.date,
                                entry.time,
                                'missed'
                              )
                            }
                          >
                            Mark Missed
                          </Button>
                        </Group>
                      </>
                    )}

                    {existing && existing.status === 'scheduled' && (
                      <>
                        <Divider my="sm" />
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            onClick={() =>
                              handleStatusUpdate(existing.id, 'attended')
                            }
                          >
                            Mark Attended
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            color="yellow"
                            onClick={() =>
                              handleStatusUpdate(existing.id, 'canceled')
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            onClick={() =>
                              handleStatusUpdate(existing.id, 'missed')
                            }
                          >
                            Mark Missed
                          </Button>
                        </Group>
                      </>
                    )}
                  </Card>
                );
              })}
            </>
          )}

          {/* Past recorded sessions */}
          {pastSessions.length > 0 && (
            <>
              <Text size="sm" c="dimmed" fw={500} mt="md">
                Past Sessions
              </Text>
              {pastSessions.map(session => (
                <Card key={session.id} withBorder padding="md">
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Group gap="md" mb="xs">
                        <SessionStatusBadge status={session.status} />
                      </Group>
                      <Group c="dimmed">
                        <Group gap="xs">
                          <IconCalendar size={14} />
                          <Text size="sm">
                            {format(
                              new Date(session.date + 'T00:00:00'),
                              'MMM dd, yyyy'
                            )}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <IconClock size={14} />
                          <Text size="sm">{formatTime(session.time)}</Text>
                        </Group>
                      </Group>
                      {session.notes && (
                        <Text size="sm" c="dimmed" mt="xs">
                          {session.notes}
                        </Text>
                      )}
                    </div>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(session.id)}
                      title="Delete session"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </>
          )}

          {upcoming.length === 0 && pastSessions.length === 0 && (
            <Card withBorder p="xl">
              <Stack align="center" gap="md">
                <IconCalendar size={48} color="var(--mantine-color-gray-5)" />
                <Text c="dimmed">No sessions scheduled.</Text>
              </Stack>
            </Card>
          )}
        </Stack>
      )}

      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="Add New Session"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Date"
            type="date"
            value={formData.date}
            onChange={e =>
              setFormData(prev => ({ ...prev, date: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Time"
            type="time"
            value={formData.time}
            onChange={e =>
              setFormData(prev => ({ ...prev, time: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Notes (Optional)"
            placeholder="Add any notes"
            value={formData.notes}
            onChange={e =>
              setFormData(prev => ({ ...prev, notes: e.currentTarget.value }))
            }
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Session</Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
