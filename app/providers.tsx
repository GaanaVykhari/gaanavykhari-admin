'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily:
    'var(--font-open-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
  components: {
    Container: {
      defaultProps: {
        size: 'lg',
      },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications />
      {children}
    </MantineProvider>
  );
}
