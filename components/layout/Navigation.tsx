'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Stack,
  Text,
  Button,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUsers,
  IconCreditCard,
  IconSettings,
  IconDashboard,
  IconLogout,
  IconCalendarEvent,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import Loader from '@/components/common/Loader';

const navigationItems = [
  { label: 'Dashboard', href: '/', icon: IconDashboard },
  { label: 'Schedule', href: '/schedule', icon: IconCalendarEvent },
  { label: 'Students', href: '/students', icon: IconUsers },
  { label: 'Payments', href: '/payments', icon: IconCreditCard },
  { label: 'Settings', href: '/settings', icon: IconSettings },
];

export default function Navigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();
  const { user, loading } = useAuth();

  if (!user && !loading) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Loader size={48} />
      </div>
    );
  }

  const handleNavClick = () => {
    close();
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" align="center">
          <Group align="center">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Image
              src="/favicon.svg"
              alt="Gaanavykhari Icon"
              width={24}
              height={24}
            />
            <Text size="xl" fw={800} style={{ letterSpacing: '0.5px' }}>
              Gaanavykhari
            </Text>
          </Group>
          <Group align="center" gap="xs" visibleFrom="sm">
            <Text
              size="sm"
              c="dimmed"
              style={{
                whiteSpace: 'nowrap',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={user?.email || ''}
            >
              {user?.email}
            </Text>
            <ThemeToggle />
            <LogoutButton compact />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="xs">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={<Icon size="1.2rem" stroke={1.5} />}
                  active={isActive}
                  variant={isActive ? 'filled' : 'subtle'}
                  onClick={handleNavClick}
                />
              );
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section hiddenFrom="sm">
          <Stack gap="xs" mt="md">
            <Group justify="center">
              <ThemeToggle />
            </Group>
            <Text size="sm" c="dimmed" ta="center">
              {user?.email}
            </Text>
            <LogoutButton />
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

function LogoutButton({ compact }: { compact?: boolean }) {
  const { signOut } = useAuth();

  if (compact) {
    return (
      <ActionIcon variant="subtle" color="red" onClick={signOut} title="Logout">
        <IconLogout size={18} />
      </ActionIcon>
    );
  }

  return (
    <Button
      variant="subtle"
      color="red"
      leftSection={<IconLogout size={16} />}
      onClick={signOut}
      fullWidth
    >
      Logout
    </Button>
  );
}
