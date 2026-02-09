'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Stack,
  Group,
  SegmentedControl,
  Table,
  Badge,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { formatShortDate } from '@/lib/format';
import type { NotificationLog } from '@/types';

export default function SettingsPage() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=20');
      const data = await response.json();
      if (data.ok) {
        setNotifications(data.data || []);
      }
    } catch {
      // Notifications endpoint may not exist yet
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        Settings
      </Title>

      {/* Theme Preference */}
      <Card withBorder mb="lg" padding="lg">
        <Title order={4} mb="md">
          Appearance
        </Title>
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Theme
            </Text>
            <SegmentedControl
              value={colorScheme}
              onChange={value =>
                setColorScheme(value as 'light' | 'dark' | 'auto')
              }
              data={[
                {
                  value: 'light',
                  label: (
                    <Group gap="xs" justify="center">
                      <IconSun size={16} />
                      <Text size="sm">Light</Text>
                    </Group>
                  ),
                },
                {
                  value: 'dark',
                  label: (
                    <Group gap="xs" justify="center">
                      <IconMoon size={16} />
                      <Text size="sm">Dark</Text>
                    </Group>
                  ),
                },
                {
                  value: 'auto',
                  label: (
                    <Group gap="xs" justify="center">
                      <IconDeviceDesktop size={16} />
                      <Text size="sm">System</Text>
                    </Group>
                  ),
                },
              ]}
            />
          </div>
        </Stack>
      </Card>

      {/* Notification Log */}
      <Card withBorder padding="lg">
        <Title order={4} mb="md">
          Notification Log
        </Title>
        {loading ? (
          <Text c="dimmed">Loading notifications...</Text>
        ) : notifications.length === 0 ? (
          <Text c="dimmed" ta="center" py="md">
            No notifications sent yet
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Recipient</Table.Th>
                <Table.Th>Subject</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Sent</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {notifications.map(log => (
                <Table.Tr key={log.id}>
                  <Table.Td>
                    <div>
                      <Text size="sm" fw={500}>
                        {log.recipient_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {log.recipient_email}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{log.subject}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {log.type.replace(/_/g, ' ')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={log.status === 'sent' ? 'green' : 'red'}
                      variant="light"
                      size="sm"
                    >
                      {log.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatShortDate(log.sent_at)}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}
