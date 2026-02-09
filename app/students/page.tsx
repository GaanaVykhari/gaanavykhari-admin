'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  IconMail,
} from '@tabler/icons-react';
import AddStudentForm from '@/components/students/AddStudentForm';
import { formatTime } from '@/lib/format';
import type { Student } from '@/types';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);

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

  const frequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      fortnightly: 'Fortnightly',
      monthly: 'Monthly',
    };
    return labels[freq] || freq;
  };

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
        <Text c="dimmed" ta="center" py="xl">
          Loading students...
        </Text>
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

              <Stack gap={4}>
                <Group gap="xs">
                  <IconMail size={14} color="var(--mantine-color-dimmed)" />
                  <Text size="sm" c="dimmed">
                    {student.email}
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconPhone size={14} color="var(--mantine-color-dimmed)" />
                  <Text size="sm" c="dimmed">
                    {student.phone}
                  </Text>
                </Group>
              </Stack>

              <Group mt="sm" gap="xs">
                <Badge variant="outline" size="sm">
                  {frequencyLabel(student.schedule_frequency)}
                </Badge>
                <Badge variant="outline" size="sm">
                  {formatTime(student.schedule_time)}
                </Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <AddStudentForm opened={addModalOpened} onClose={closeAddModal} />
    </Container>
  );
}
