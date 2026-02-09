'use client';

import {
  Container,
  Title,
  Card,
  Text,
  Stack,
  Group,
  SegmentedControl,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';

export default function SettingsPage() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        Settings
      </Title>

      <Card withBorder padding="lg">
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
              fullWidth
              data={[
                {
                  value: 'light',
                  label: (
                    <Group gap={6} justify="center" wrap="nowrap">
                      <IconSun size={16} />
                      <span>Light</span>
                    </Group>
                  ),
                },
                {
                  value: 'dark',
                  label: (
                    <Group gap={6} justify="center" wrap="nowrap">
                      <IconMoon size={16} />
                      <span>Dark</span>
                    </Group>
                  ),
                },
                {
                  value: 'auto',
                  label: (
                    <Group gap={6} justify="center" wrap="nowrap">
                      <IconDeviceDesktop size={16} />
                      <span>System</span>
                    </Group>
                  ),
                },
              ]}
            />
          </div>
        </Stack>
      </Card>
    </Container>
  );
}
