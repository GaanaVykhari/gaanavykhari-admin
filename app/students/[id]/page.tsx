'use client';

import { useState, useEffect, use } from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  Tabs,
  Divider,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconEdit,
  IconCalendar,
  IconCreditCard,
  IconPhone,
  IconClock,
  IconBrandWhatsapp,
} from '@tabler/icons-react';
import EditStudentForm from '@/components/students/EditStudentForm';
import SessionManager from '@/components/sessions/SessionManager';
import { StudentDetailSkeleton } from '@/components/common/Skeletons';
import { formatTime, formatShortDate, formatCurrency } from '@/lib/format';
import { DAY_LABELS } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import type { Student } from '@/types';

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const loadStudent = async () => {
    try {
      const response = await fetch(`/api/students/${id}`);
      const data = await response.json();
      if (data.ok) {
        setStudent(data.data);
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <Container size="lg" py="md">
        <StudentDetailSkeleton />
      </Container>
    );
  }

  if (!student) {
    return (
      <Container size="lg" py="md">
        <Text c="dimmed">Student not found</Text>
      </Container>
    );
  }

  const scheduleEntries = Object.entries(student.schedule || {}).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>{student.name}</Title>
        <Button
          leftSection={<IconEdit size={16} />}
          variant="light"
          onClick={openEdit}
        >
          Edit
        </Button>
      </Group>

      <Card withBorder mb="lg" padding="lg">
        <Stack gap="sm">
          <Group>
            <Badge color={student.is_active ? 'green' : 'gray'} variant="light">
              {student.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </Group>

          <Divider />

          <Group gap="xs">
            <IconPhone size={16} color="var(--mantine-color-dimmed)" />
            <Text size="sm">{student.phone}</Text>
            <ActionIcon
              variant="subtle"
              color="green"
              size="sm"
              component="a"
              href={getWhatsAppUrl(student.phone)}
              target="_blank"
              rel="noopener noreferrer"
              title="Open WhatsApp"
            >
              <IconBrandWhatsapp size={16} />
            </ActionIcon>
          </Group>

          <Group gap="xl" wrap="wrap">
            <div>
              <Text size="xs" c="dimmed">
                Fee
              </Text>
              <Text fw={500}>
                {formatCurrency(student.fee_amount)} / {student.fee_per_classes}{' '}
                classes
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                Induction Date
              </Text>
              <Text size="sm">{formatShortDate(student.induction_date)}</Text>
            </div>
            {student.last_class_date && (
              <div>
                <Text size="xs" c="dimmed">
                  Last Class
                </Text>
                <Text size="sm">
                  {formatShortDate(student.last_class_date)}
                </Text>
              </div>
            )}
          </Group>

          {scheduleEntries.length > 0 && (
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Weekly Schedule
              </Text>
              <Group gap="xs" wrap="wrap">
                {scheduleEntries.map(([day, time]) => (
                  <Badge key={day} variant="light" size="lg">
                    <Group gap={4} wrap="nowrap">
                      {DAY_LABELS[day] || day}
                      <IconClock size={12} />
                      {formatTime(time)}
                    </Group>
                  </Badge>
                ))}
              </Group>
            </div>
          )}
        </Stack>
      </Card>

      <Tabs defaultValue="sessions">
        <Tabs.List>
          <Tabs.Tab value="sessions" leftSection={<IconCalendar size={16} />}>
            Sessions
          </Tabs.Tab>
          <Tabs.Tab value="payments" leftSection={<IconCreditCard size={16} />}>
            Payments
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="sessions" pt="md">
          <SessionManager
            studentId={student.id}
            student={student}
            onSessionUpdated={loadStudent}
          />
        </Tabs.Panel>

        <Tabs.Panel value="payments" pt="md">
          <Text c="dimmed">Payment history for {student.name}</Text>
        </Tabs.Panel>
      </Tabs>

      <EditStudentForm
        opened={editOpened}
        onClose={() => {
          closeEdit();
          loadStudent();
        }}
        student={student}
      />
    </Container>
  );
}
