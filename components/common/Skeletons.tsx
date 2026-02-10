'use client';

import { SimpleGrid, Card, Group, Stack, Skeleton, Paper } from '@mantine/core';

export function StatsCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: count }} mb="xl">
      {Array.from({ length: count }).map((_, i) => (
        <Paper key={i} withBorder p="md" radius="md">
          <Group justify="space-between" align="center">
            <div style={{ flex: 1 }}>
              <Skeleton height={12} width="60%" mb={8} />
              <Skeleton height={24} width="40%" mb={8} />
              <Skeleton height={10} width="50%" />
            </div>
            <Skeleton height={48} width={48} radius="md" />
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

export function ScheduleCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} withBorder padding="sm">
          <Group justify="space-between">
            <div style={{ flex: 1 }}>
              <Skeleton height={16} width="40%" mb={8} />
              <Skeleton height={12} width="25%" />
            </div>
            <Skeleton height={20} width={60} radius="xl" />
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

export function StudentCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} withBorder padding="md">
          <Group justify="space-between" mb="xs">
            <Skeleton height={18} width="50%" />
            <Skeleton height={20} width={60} radius="xl" />
          </Group>
          <Skeleton height={12} width="40%" mb="sm" />
          <Group gap="xs">
            <Skeleton height={22} width={80} radius="xl" />
            <Skeleton height={22} width={80} radius="xl" />
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export function PaymentCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Stack gap="md">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} withBorder padding="md">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Group gap="md" mb="xs">
                <Skeleton height={18} width="30%" />
                <Skeleton height={20} width={60} radius="xl" />
              </Group>
              <Group gap="xl">
                <Skeleton height={12} width={100} />
                <Skeleton height={12} width={100} />
              </Group>
            </div>
            <Group gap="xs">
              <Skeleton height={28} width={80} radius="sm" />
              <Skeleton height={28} width={60} radius="sm" />
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

export function StudentDetailSkeleton() {
  return (
    <Card withBorder padding="lg">
      <Stack gap="sm">
        <Skeleton height={22} width={80} radius="xl" />
        <Skeleton height={1} />
        <Skeleton height={14} width="30%" />
        <Group gap="xl">
          <div>
            <Skeleton height={10} width={30} mb={4} />
            <Skeleton height={16} width={120} />
          </div>
          <div>
            <Skeleton height={10} width={60} mb={4} />
            <Skeleton height={14} width={100} />
          </div>
        </Group>
        <div>
          <Skeleton height={10} width={100} mb={8} />
          <Group gap="xs">
            <Skeleton height={26} width={120} radius="xl" />
            <Skeleton height={26} width={120} radius="xl" />
          </Group>
        </div>
      </Stack>
    </Card>
  );
}

export function SessionCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Stack gap="md">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} withBorder padding="md">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Group gap="md" mb="xs">
                <Skeleton height={16} width="35%" />
                <Skeleton height={20} width={50} radius="xl" />
              </Group>
              <Skeleton height={12} width="20%" />
            </div>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
