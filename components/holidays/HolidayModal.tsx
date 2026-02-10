'use client';

import { useState } from 'react';
import { toLocalDateStr } from '@/lib/format';
import {
  Modal,
  Button,
  Group,
  Textarea,
  Stack,
  Text,
  Alert,
  ActionIcon,
  CopyButton,
  Tooltip,
  ScrollArea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  IconCalendar,
  IconPlus,
  IconBrandWhatsapp,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';
import { getWhatsAppUrl, getHolidayMessage } from '@/lib/whatsapp';

interface AffectedStudent {
  id: string;
  name: string;
  phone: string;
}

interface HolidayModalProps {
  opened: boolean;
  onClose: () => void;
  onHolidayCreated: () => void;
}

export function HolidayModal({
  opened,
  onClose,
  onHolidayCreated,
}: HolidayModalProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'notify'>('form');
  const [affectedStudents, setAffectedStudents] = useState<AffectedStudent[]>(
    []
  );
  const [holidayMessage, setHolidayMessage] = useState('');

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select both from and to dates',
        color: 'red',
      });
      return;
    }

    if (fromDate > toDate) {
      notifications.show({
        title: 'Validation Error',
        message: 'From date must be before or equal to to date',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const fromStr = toLocalDateStr(fromDate);
      const toStr = toLocalDateStr(toDate);

      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_date: fromStr,
          to_date: toStr,
          description,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        notifications.show({
          title: 'Success',
          message: 'Holiday created successfully',
          color: 'green',
        });
        onHolidayCreated();

        const students = data.data?.affectedStudents || [];
        const msg = getHolidayMessage(fromStr, toStr, description || undefined);
        setAffectedStudents(students);
        setHolidayMessage(msg);
        setStep('notify');
      } else {
        notifications.show({
          title: 'Error',
          message: data.message || 'Failed to create holiday',
          color: 'red',
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to create holiday',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFromDate(null);
    setToDate(null);
    setDescription('');
    setLoading(false);
    setStep('form');
    setAffectedStudents([]);
    setHolidayMessage('');
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={step === 'form' ? 'Schedule Holiday' : 'Notify Students'}
      size="md"
      centered
    >
      {step === 'form' ? (
        <Stack gap="md">
          <Alert color="blue" variant="light">
            <Text size="sm">
              Select a date range for the holiday. Any scheduled sessions during
              this period will be automatically canceled.
            </Text>
          </Alert>

          <DateInput
            label="From Date"
            placeholder="Select start date"
            value={fromDate}
            onChange={value => setFromDate(value ? new Date(value) : null)}
            minDate={getMinDate()}
            leftSection={<IconCalendar size={16} />}
            required
          />

          <DateInput
            label="To Date"
            placeholder="Select end date"
            value={toDate}
            onChange={value => setToDate(value ? new Date(value) : null)}
            minDate={fromDate || getMinDate()}
            leftSection={<IconCalendar size={16} />}
            required
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Enter holiday description..."
            value={description}
            onChange={e => setDescription(e.currentTarget.value)}
            rows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              leftSection={<IconPlus size={16} />}
            >
              Create Holiday
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="md">
          <Alert color="green" variant="light">
            <Text size="sm">
              Holiday created. Send the message below to your students via
              WhatsApp.
            </Text>
          </Alert>

          <Group gap="xs" align="flex-start">
            <Textarea
              value={holidayMessage}
              readOnly
              rows={5}
              style={{ flex: 1 }}
            />
            <CopyButton value={holidayMessage}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy message'}>
                  <ActionIcon
                    variant="light"
                    color={copied ? 'teal' : 'gray'}
                    onClick={copy}
                    size="lg"
                  >
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>

          <Text size="sm" fw={500}>
            Send to students ({affectedStudents.length})
          </Text>
          <ScrollArea.Autosize mah={250}>
            <Stack gap="xs">
              {affectedStudents.map(s => (
                <Group key={s.id} justify="space-between">
                  <Text size="sm">{s.name}</Text>
                  <ActionIcon
                    variant="light"
                    color="green"
                    component="a"
                    href={getWhatsAppUrl(s.phone, holidayMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`WhatsApp ${s.name}`}
                  >
                    <IconBrandWhatsapp size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </ScrollArea.Autosize>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleClose}>
              Done
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
