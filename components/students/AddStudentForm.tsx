'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toLocalDateStr } from '@/lib/format';
import {
  Modal,
  TextInput,
  NumberInput,
  Button,
  Stack,
  Group,
  Checkbox,
  Text,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUserPlus } from '@tabler/icons-react';
import { DAY_OPTIONS } from '@/lib/constants';
import type { WeeklySchedule } from '@/types';

interface AddStudentFormProps {
  opened: boolean;
  onClose: () => void;
}

export default function AddStudentForm({
  opened,
  onClose,
}: AddStudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      fee_per_classes: 4,
      fee_amount: 0,
      schedule: {} as WeeklySchedule,
      induction_date: new Date(),
    },
    validate: {
      name: value =>
        value.length < 2 ? 'Name must be at least 2 characters' : null,
      phone: value =>
        value.length < 10 ? 'Phone must be at least 10 digits' : null,
      fee_amount: value =>
        value <= 0 ? 'Amount must be greater than 0' : null,
      fee_per_classes: value =>
        value <= 0 ? 'Number of classes must be greater than 0' : null,
      schedule: value =>
        Object.keys(value).length === 0 ? 'Select at least one day' : null,
    },
  });

  const toggleDay = (day: string) => {
    const current = { ...form.values.schedule };
    if (day in current) {
      delete current[day];
    } else {
      current[day] = '09:00';
    }
    form.setFieldValue('schedule', current);
  };

  const setDayTime = (day: string, time: string) => {
    form.setFieldValue('schedule', {
      ...form.values.schedule,
      [day]: time,
    });
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          induction_date: toLocalDateStr(values.induction_date),
        }),
      });

      const data = await response.json();

      if (data.ok) {
        notifications.show({
          title: 'Success',
          message: 'Student added successfully',
          color: 'green',
        });
        form.reset();
        onClose();
        router.refresh();
      } else {
        throw new Error(data.message || 'Failed to add student');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to add student';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Student"
      size="lg"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Full Name"
            placeholder="Enter student's full name"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Phone Number"
            placeholder="+919876543210"
            required
            {...form.getInputProps('phone')}
          />

          <TextInput
            label="Email"
            placeholder="Enter student's email (optional)"
            {...form.getInputProps('email')}
          />

          <Group grow>
            <NumberInput
              label="Classes per Cycle"
              min={1}
              required
              {...form.getInputProps('fee_per_classes')}
            />
            <NumberInput
              label="Fee Amount (INR)"
              min={0}
              required
              {...form.getInputProps('fee_amount')}
            />
          </Group>

          <DateInput
            label="Induction Date"
            placeholder="Select induction date"
            required
            {...form.getInputProps('induction_date')}
          />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Weekly Schedule
            </Text>
            {form.errors.schedule && (
              <Text size="xs" c="red" mb="xs">
                {form.errors.schedule}
              </Text>
            )}
            <Stack gap="xs">
              {DAY_OPTIONS.map(day => {
                const isSelected = day.value in form.values.schedule;
                return (
                  <Group key={day.value} gap="sm">
                    <Checkbox
                      label={day.label}
                      checked={isSelected}
                      onChange={() => toggleDay(day.value)}
                      styles={{ label: { width: 100 } }}
                    />
                    {isSelected && (
                      <TimeInput
                        size="xs"
                        value={form.values.schedule[day.value]}
                        onChange={e =>
                          setDayTime(day.value, e.currentTarget.value)
                        }
                        style={{ width: 120 }}
                      />
                    )}
                  </Group>
                );
              })}
            </Stack>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftSection={<IconUserPlus size={16} />}
            >
              Add Student
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
