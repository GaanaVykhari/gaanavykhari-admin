'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Text,
  Group,
  Button,
  Stack,
  Switch,
  Badge,
  Alert,
  Loader,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  IconCalendarCancel,
  IconCalendarEvent,
  IconClock,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { formatTime } from '@/lib/format';
import {
  getWhatsAppUrl,
  getCancellationMessage,
  getRescheduleMessage,
} from '@/lib/whatsapp';

interface DayEntry {
  studentName: string;
  studentId: string;
  time: string;
  source: 'schedule' | 'adhoc';
  status?: string;
}

interface CancelRescheduleModalProps {
  opened: boolean;
  onClose: () => void;
  studentName: string;
  studentPhone: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  sessionId?: string;
  onCompleted: () => void;
}

export function CancelRescheduleModal({
  opened,
  onClose,
  studentName,
  studentPhone,
  studentId,
  date,
  time,
  sessionId,
  onCompleted,
}: CancelRescheduleModalProps) {
  const [reschedule, setReschedule] = useState(false);
  const [newDateStr, setNewDateStr] = useState<string | null>(null);
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [isHolidayDate, setIsHolidayDate] = useState(false);

  const fetchDaySchedule = useCallback(async (dateStr: string) => {
    setLoadingConflicts(true);
    try {
      const res = await fetch(`/api/schedule/day?date=${dateStr}`);
      const data = await res.json();
      if (data.ok) {
        setDayEntries(data.data.entries || []);
        setIsHolidayDate(data.data.isHoliday || false);
      }
    } catch {
      setDayEntries([]);
    } finally {
      setLoadingConflicts(false);
    }
  }, []);

  useEffect(() => {
    if (newDateStr && reschedule) {
      fetchDaySchedule(newDateStr);
    } else {
      setDayEntries([]);
      setIsHolidayDate(false);
    }
  }, [newDateStr, reschedule, fetchDaySchedule]);

  useEffect(() => {
    if (!opened) {
      setReschedule(false);
      setNewDateStr(null);
      setNewTime('');
      setDayEntries([]);
      setIsHolidayDate(false);
    }
  }, [opened]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // 1. Cancel the original session
      if (sessionId) {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'canceled' }),
        });
        if (!res.ok) {
          throw new Error('Failed to cancel session');
        }
      } else {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            date,
            time,
            status: 'canceled',
            notes: 'Cancelled',
          }),
        });
        if (!res.ok) {
          throw new Error('Failed to create canceled session record');
        }
      }

      // 2. Create rescheduled session if applicable
      if (reschedule && newDateStr && newTime) {
        const originalDateObj = new Date(date + 'T00:00:00');
        const shortOriginal = originalDateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            date: newDateStr,
            time: newTime,
            notes: `Rescheduled from ${shortOriginal}`,
          }),
        });
        if (!res.ok) {
          throw new Error('Failed to create rescheduled session');
        }
      }

      // 3. Open WhatsApp
      if (reschedule && newDateStr && newTime) {
        const msg = getRescheduleMessage(
          studentName,
          date,
          time,
          newDateStr,
          newTime
        );
        window.open(getWhatsAppUrl(studentPhone, msg), '_blank');
      } else {
        const msg = getCancellationMessage(studentName, date, time);
        window.open(getWhatsAppUrl(studentPhone, msg), '_blank');
      }

      notifications.show({
        title: 'Success',
        message: reschedule
          ? 'Session cancelled and rescheduled'
          : 'Session cancelled',
        color: 'green',
      });

      onCompleted();
      onClose();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to process cancellation',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const originalDateDisplay = new Date(date + 'T00:00:00').toLocaleDateString(
    'en-US',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }
  );

  const hasConflict =
    reschedule && newDateStr && dayEntries.some(e => e.studentId === studentId);

  const canConfirmReschedule =
    !reschedule || (newDateStr && newTime && !hasConflict);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Cancel Session"
      size="md"
      centered
    >
      <Stack gap="md">
        <Group gap="xs">
          <IconCalendarCancel size={20} color="var(--mantine-color-red-6)" />
          <Text size="sm">
            Cancel session for <strong>{studentName}</strong> on{' '}
            <strong>{originalDateDisplay}</strong> at{' '}
            <strong>{formatTime(time)}</strong>?
          </Text>
        </Group>

        <Switch
          label="Reschedule to a different time"
          checked={reschedule}
          onChange={e => setReschedule(e.currentTarget.checked)}
        />

        {reschedule && (
          <Stack gap="sm">
            <DateInput
              label="New Date"
              placeholder="Pick a date"
              value={newDateStr}
              onChange={setNewDateStr}
              minDate={todayStr}
            />

            <TimeInput
              label="New Time"
              placeholder="Pick a time"
              value={newTime}
              onChange={e => setNewTime(e.currentTarget.value)}
            />

            {isHolidayDate && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                color="orange"
                variant="light"
              >
                This date is marked as a holiday!
              </Alert>
            )}

            {hasConflict && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                color="red"
                variant="light"
              >
                {studentName} already has a session on this date.
              </Alert>
            )}

            {newDateStr && (
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Existing sessions on this date:
                </Text>
                {loadingConflicts ? (
                  <Group justify="center" py="xs">
                    <Loader size="sm" />
                  </Group>
                ) : dayEntries.length === 0 ? (
                  <Text size="xs" c="dimmed">
                    No sessions scheduled — this slot is free.
                  </Text>
                ) : (
                  <Stack gap={4}>
                    {dayEntries.map((entry, i) => {
                      const isConflict = entry.studentId === studentId;
                      return (
                        <Group
                          key={i}
                          gap="xs"
                          style={
                            isConflict
                              ? {
                                  background: 'var(--mantine-color-red-light)',
                                  borderRadius: 4,
                                  padding: '2px 6px',
                                  margin: '0 -6px',
                                }
                              : undefined
                          }
                        >
                          <IconClock
                            size={14}
                            color={
                              isConflict
                                ? 'var(--mantine-color-red-6)'
                                : undefined
                            }
                          />
                          <Text
                            size="sm"
                            c={isConflict ? 'red' : undefined}
                            fw={isConflict ? 600 : undefined}
                          >
                            {formatTime(entry.time)} — {entry.studentName}
                            {isConflict && ' (conflict)'}
                          </Text>
                          {entry.source === 'adhoc' && (
                            <Badge size="xs" variant="light">
                              adhoc
                            </Badge>
                          )}
                        </Group>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={loading}>
            Go Back
          </Button>
          <Button
            color={reschedule ? 'blue' : 'red'}
            onClick={handleConfirm}
            loading={loading}
            disabled={!canConfirmReschedule}
            leftSection={
              reschedule ? (
                <IconCalendarEvent size={16} />
              ) : (
                <IconCalendarCancel size={16} />
              )
            }
          >
            {reschedule ? 'Cancel & Reschedule' : 'Cancel Session'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
