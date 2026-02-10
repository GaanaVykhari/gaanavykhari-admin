'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Title,
  TextInput,
  Button,
  Group,
  Stack,
  Card,
  Text,
  Badge,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import {
  IconSearch,
  IconUserPlus,
  IconPhone,
  IconBrandWhatsapp,
} from '@tabler/icons-react';
import AddStudentForm from '@/components/students/AddStudentForm';
import { StudentCardSkeleton } from '@/components/common/Skeletons';
import { formatTime } from '@/lib/format';
import { DAY_LABELS } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import type { Student } from '@/types';

function formatScheduleBadges(schedule: Record<string, string>) {
  const entries = Object.entries(schedule).sort(
    ([a], [b]) => Number(a) - Number(b)
  );
  return entries.map(([day, time]) => (
    <Badge key={day} variant="outline" size="sm">
      {DAY_LABELS[day] || day} {formatTime(time)}
    </Badge>
  ));
}

export default function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(searchParams.get('action') === 'add');

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      const response = await fetch(`/api/students?${params.toString()}`);
      const data = await response.json();
      if (data.ok) {
        setStudents(data.data.rows);
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Students</Title>
        <Button leftSection={<IconUserPlus size={16} />} onClick={openAddModal}>
          Add Student
        </Button>
      </Group>

      <TextInput
        placeholder="Search students..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={e => setSearch(e.currentTarget.value)}
        mb="lg"
      />

      {loading ? (
        <StudentCardSkeleton count={6} />
      ) : students.length === 0 ? (
        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <Text fw={500}>No students found</Text>
            <Text c="dimmed" size="sm">
              {search
                ? 'Try a different search term'
                : 'Add your first student to get started'}
            </Text>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {students.map(student => (
            <Card
              key={student.id}
              withBorder
              padding="md"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/students/${student.id}`)}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="lg">
                  {student.name}
                </Text>
                <Badge
                  color={student.is_active ? 'green' : 'gray'}
                  variant="light"
                >
                  {student.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Group>

              <Group gap="xs">
                <IconPhone size={14} color="var(--mantine-color-dimmed)" />
                <Text size="sm" c="dimmed">
                  {student.phone}
                </Text>
                <IconBrandWhatsapp
                  size={14}
                  color="var(--mantine-color-green-6)"
                  style={{ cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation();
                    window.open(getWhatsAppUrl(student.phone), '_blank');
                  }}
                />
              </Group>

              <Group mt="sm" gap="xs" wrap="wrap">
                {formatScheduleBadges(student.schedule || {})}
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <AddStudentForm opened={addModalOpened} onClose={closeAddModal} />
    </Container>
  );
}
