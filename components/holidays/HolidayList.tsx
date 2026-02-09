'use client';

import { useState } from 'react';
import {
  Paper,
  Group,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Tooltip,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { formatDateRange } from '@/lib/format';
import type { Holiday } from '@/types';

interface HolidayListProps {
  holidays: Holiday[];
  onHolidayDeleted: () => void;
}

export function HolidayList({ holidays, onHolidayDeleted }: HolidayListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);

  const handleDelete = (holidayId: string) => {
    setHolidayToDelete(holidayId);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    if (!holidayToDelete) {
      return;
    }

    setDeletingId(holidayToDelete);
    try {
      const response = await fetch(`/api/holidays/${holidayToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.ok) {
        notifications.show({
          title: 'Success',
          message: 'Holiday deleted successfully',
          color: 'green',
        });
        onHolidayDeleted();
      } else {
        notifications.show({
          title: 'Error',
          message: data.message || 'Failed to delete holiday',
          color: 'red',
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete holiday',
        color: 'red',
      });
    } finally {
      setDeletingId(null);
      setHolidayToDelete(null);
    }
  };

  if (holidays.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">
          No holidays scheduled
        </Text>
      </Paper>
    );
  }

  return (
    <>
      <Stack gap="sm">
        {holidays.map(holiday => (
          <Paper key={holiday.id} p="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Group gap="xs" mb="xs">
                  <Text fw={500}>
                    {formatDateRange(holiday.from_date, holiday.to_date)}
                  </Text>
                  <Badge color="red" variant="light">
                    Holiday
                  </Badge>
                </Group>
                {holiday.description && (
                  <Text size="sm" c="dimmed">
                    {holiday.description}
                  </Text>
                )}
              </div>
              <Tooltip label="Delete holiday">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(holiday.id)}
                  loading={deletingId === holiday.id}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Paper>
        ))}
      </Stack>

      <ConfirmationModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        onConfirm={confirmDelete}
        title="Delete Holiday"
        message="Are you sure you want to delete this holiday?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="red"
        loading={deletingId !== null}
      />
    </>
  );
}
