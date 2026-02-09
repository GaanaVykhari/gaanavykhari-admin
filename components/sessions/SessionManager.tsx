'use client';

import { useState, useEffect } from 'react';
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
  Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCalendar,
  IconClock,
  IconEdit,
  IconTrash,
  IconPlus,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { SessionStatusBadge } from '@/components/common/StatusBadge';
import type { SessionStatus } from '@/types';

interface SessionData {
  id: string;
  student_id: string;
  date: string;
  time: string;
  status: SessionStatus;
  notes: string | null;
  students?: { id: string; name: string; email: string; phone: string };
}

interface SessionManagerProps {
  studentId?: string;
  onSessionUpdated?: () => void;
}

export default function SessionManager({
  studentId,
  onSessionUpdated,
}: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
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

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

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
          {sessions.map(session => (
            <Card key={session.id} withBorder padding="md">
              <Group justify="space-between" align="flex-start">
                <div style={{ flex: 1 }}>
                  <Group gap="md" mb="xs">
                    {session.students && (
                      <Text fw={500} size="lg">
                        {session.students.name}
                      </Text>
                    )}
                    <SessionStatusBadge status={session.status} />
                    {new Date(session.date) < new Date() &&
                      session.status === 'scheduled' && (
                        <Badge color="red" variant="filled">
                          Past Due
                        </Badge>
                      )}
                  </Group>

                  <Group c="dimmed">
                    <Group gap="xs">
                      <IconCalendar size={14} />
                      <Text size="sm">
                        {format(new Date(session.date), 'MMM dd, yyyy')}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <IconClock size={14} />
                      <Text size="sm">{session.time}</Text>
                    </Group>
                  </Group>

                  {session.notes && (
                    <Text size="sm" c="dimmed" mt="xs">
                      {session.notes}
                    </Text>
                  )}
                </div>

                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(session.id)}
                    title="Delete session"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              {session.status === 'scheduled' && (
                <>
                  <Divider my="sm" />
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      onClick={() => handleStatusUpdate(session.id, 'attended')}
                    >
                      Mark Attended
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="yellow"
                      onClick={() => handleStatusUpdate(session.id, 'canceled')}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => handleStatusUpdate(session.id, 'missed')}
                    >
                      Mark Missed
                    </Button>
                  </Group>
                </>
              )}
            </Card>
          ))}

          {sessions.length === 0 && (
            <Card withBorder p="xl">
              <Stack align="center" gap="md">
                <IconCalendar size={48} color="var(--mantine-color-gray-5)" />
                <Text c="dimmed">
                  {studentId
                    ? 'No sessions for this student yet.'
                    : 'No sessions scheduled yet.'}
                </Text>
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
