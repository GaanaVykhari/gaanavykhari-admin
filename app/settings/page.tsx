'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Card,
  Text,
  Stack,
  Group,
  SegmentedControl,
  PasswordInput,
  Button,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      notifications.show({
        title: 'Error',
        message: 'Please enter your current password',
        color: 'red',
      });
      return;
    }

    if (newPassword.length < 6) {
      notifications.show({
        title: 'Error',
        message: 'New password must be at least 6 characters',
        color: 'red',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match',
        color: 'red',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const supabase = createClient();

      // Verify current password by re-authenticating
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('Unable to verify current user');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        notifications.show({
          title: 'Error',
          message: 'Current password is incorrect',
          color: 'red',
        });
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      // Sign out and redirect to login
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      notifications.show({
        title: 'Error',
        message:
          err instanceof Error ? err.message : 'Failed to change password',
        color: 'red',
      });
    } finally {
      setChangingPassword(false);
    }
  };

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

      <Card withBorder padding="lg" mt="lg">
        <Title order={4} mb="md">
          Account
        </Title>
        <Stack gap="md" maw={400}>
          <PasswordInput
            label="Current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.currentTarget.value)}
          />
          <PasswordInput
            label="New password"
            description="Must be at least 6 characters"
            value={newPassword}
            onChange={e => setNewPassword(e.currentTarget.value)}
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.currentTarget.value)}
            error={
              confirmPassword && newPassword !== confirmPassword
                ? 'Passwords do not match'
                : undefined
            }
          />
          <Button
            onClick={handleChangePassword}
            loading={changingPassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Change Password
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
