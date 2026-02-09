'use client';

import { useState } from 'react';
import {
  Modal,
  Button,
  Group,
  Textarea,
  Stack,
  Text,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

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
      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_date: fromDate.toISOString().split('T')[0],
          to_date: toDate.toISOString().split('T')[0],
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
        handleClose();
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
      title="Schedule Holiday"
      size="md"
      centered
    >
      <Stack gap="md">
        <Alert color="blue" variant="light">
          <Text size="sm">
            Select a date range for the holiday. Any scheduled sessions during
            this period will be automatically canceled and students will be
            notified via email.
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
    </Modal>
  );
}
