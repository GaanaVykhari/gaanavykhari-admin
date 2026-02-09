'use client';

import { Paper, Group, Text, ThemeIcon } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: TablerIcon;
  color?: string;
  description?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  description,
}: StatsCardProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl" mt={4}>
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt={4}>
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon color={color} variant="light" size={48} radius="md">
          <Icon size={28} stroke={1.5} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
