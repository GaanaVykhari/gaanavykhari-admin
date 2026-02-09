'use client';

import { ActionIcon, useMantineColorScheme, Tooltip } from '@mantine/core';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';

export default function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const nextScheme = () => {
    if (colorScheme === 'light') {
      setColorScheme('dark');
    } else if (colorScheme === 'dark') {
      setColorScheme('auto');
    } else {
      setColorScheme('light');
    }
  };

  const icon =
    colorScheme === 'light' ? (
      <IconSun size={18} />
    ) : colorScheme === 'dark' ? (
      <IconMoon size={18} />
    ) : (
      <IconDeviceDesktop size={18} />
    );

  const label =
    colorScheme === 'light'
      ? 'Light mode'
      : colorScheme === 'dark'
        ? 'Dark mode'
        : 'System theme';

  return (
    <Tooltip label={label}>
      <ActionIcon variant="subtle" onClick={nextScheme} size="md">
        {icon}
      </ActionIcon>
    </Tooltip>
  );
}
