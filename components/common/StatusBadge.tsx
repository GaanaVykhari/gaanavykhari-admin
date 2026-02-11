'use client';

import { Badge, Tooltip } from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconCreditCard,
} from '@tabler/icons-react';
import type { SessionStatus, PaymentStatus, PaymentIndicator } from '@/types';

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

export function PaymentBadge({
  status,
  count,
  total,
}: {
  status?: PaymentIndicator;
  count?: number;
  total?: number;
}) {
  if (!status || status === 'none') {
    return null;
  }

  const label =
    count != null && total != null
      ? `${count}/${total} classes attended since last payment`
      : undefined;

  const badge = (
    <Badge
      size="xs"
      color={status === 'overdue' ? 'red' : 'yellow'}
      variant="light"
      leftSection={<IconCreditCard size={12} />}
    >
      {status === 'overdue' ? 'Payment overdue' : 'Payment due'}
    </Badge>
  );

  return label ? <Tooltip label={label}>{badge}</Tooltip> : badge;
}
