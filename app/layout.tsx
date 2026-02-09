import { Open_Sans } from 'next/font/google';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import Providers from './providers';
import Navigation from '@/components/layout/Navigation';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata = {
  title: 'Gaanavykhari Admin',
  description: 'Music school student and payment management system',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png' }],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Gaanavykhari" />
      </head>
      <body>
        <Providers>
          <Navigation>{children}</Navigation>
        </Providers>
      </body>
    </html>
  );
}
