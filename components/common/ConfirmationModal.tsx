'use client';

import { Modal, Text, Group, Button, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'red',
  loading = false,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="sm" centered>
      <Stack gap="md">
        <Group gap="xs">
          <IconAlertTriangle size={20} color="var(--mantine-color-orange-6)" />
          <Text size="sm" c="dimmed">
            {message}
          </Text>
        </Group>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            color={confirmColor}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
