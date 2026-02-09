'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Stack,
  Group,
  MultiSelect,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUserPlus } from '@tabler/icons-react';
import {
  SCHEDULE_FREQUENCIES,
  DAY_OPTIONS,
  MONTH_DAY_OPTIONS,
} from '@/lib/constants';

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
      email: '',
      phone: '',
      fee_per_classes: 1,
      fee_amount: 0,
      schedule_frequency: 'weekly' as string,
      schedule_days_of_week: [] as string[],
      schedule_days_of_month: [] as string[],
      schedule_time: '09:00',
      induction_date: new Date(),
    },
    validate: {
      name: value =>
        value.length < 2 ? 'Name must be at least 2 characters' : null,
      email: value => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phone: value =>
        value.length < 10 ? 'Phone must be at least 10 digits' : null,
      fee_amount: value =>
        value <= 0 ? 'Amount must be greater than 0' : null,
      fee_per_classes: value =>
        value <= 0 ? 'Number of classes must be greater than 0' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          schedule_days_of_week: values.schedule_days_of_week.map(Number),
          schedule_days_of_month: values.schedule_days_of_month.map(Number),
          induction_date: values.induction_date.toISOString().split('T')[0],
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
            label="Email"
            placeholder="Enter student's email"
            required
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Phone Number"
            placeholder="Enter student's phone number"
            required
            {...form.getInputProps('phone')}
          />

          <Group grow>
            <NumberInput
              label="Number of Classes"
              placeholder="Number of classes"
              min={1}
              required
              {...form.getInputProps('fee_per_classes')}
            />
            <NumberInput
              label="Fee Amount (INR)"
              placeholder="Fee amount"
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

          <Select
            label="Schedule Frequency"
            placeholder="Select frequency"
            data={[...SCHEDULE_FREQUENCIES]}
            required
            {...form.getInputProps('schedule_frequency')}
          />

          {(form.values.schedule_frequency === 'weekly' ||
            form.values.schedule_frequency === 'fortnightly') && (
            <MultiSelect
              label="Days of the Week"
              placeholder="Select days"
              data={[...DAY_OPTIONS]}
              required
              {...form.getInputProps('schedule_days_of_week')}
            />
          )}

          {form.values.schedule_frequency === 'monthly' && (
            <MultiSelect
              label="Days of the Month"
              placeholder="Select days"
              data={MONTH_DAY_OPTIONS}
              required
              {...form.getInputProps('schedule_days_of_month')}
            />
          )}

          <TimeInput
            label="Class Time"
            placeholder="Select time"
            required
            {...form.getInputProps('schedule_time')}
          />

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
