'use client';

import { Badge } from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconCurrency,
} from '@tabler/icons-react';
import type { SessionStatus, PaymentStatus } from '@/types';

const sessionColors: Record<SessionStatus, string> = {
  attended: 'green',
  canceled: 'yellow',
  missed: 'red',
  scheduled: 'blue',
};

const sessionIcons: Record<SessionStatus, React.ReactNode> = {
  attended: <IconCheck size={14} />,
  canceled: <IconX size={14} />,
  missed: <IconAlertCircle size={14} />,
  scheduled: <IconClock size={14} />,
};

const paymentColors: Record<PaymentStatus, string> = {
  paid: 'green',
  pending: 'yellow',
  overdue: 'red',
  cancelled: 'gray',
};

const paymentIcons: Record<PaymentStatus, React.ReactNode> = {
  paid: <IconCheck size={14} />,
  pending: <IconClock size={14} />,
  overdue: <IconAlertCircle size={14} />,
  cancelled: <IconX size={14} />,
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <Badge
      color={sessionColors[status]}
      variant="light"
      leftSection={sessionIcons[status]}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      color={paymentColors[status]}
      variant="light"
      leftSection={paymentIcons[status]}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
