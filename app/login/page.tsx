'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Center,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const redirect = searchParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} py={80}>
      <Center mb="xl">
        <Stack align="center" gap="xs">
          <Image src="/favicon.svg" alt="Gaanavykhari" width={48} height={48} />
          <Title ta="center" order={2} fw={800}>
            Gaanavykhari
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Sign in to manage your music school
          </Text>
        </Stack>
      </Center>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleLogin}>
          <Stack gap="md">
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
              >
                {error}
              </Alert>
            )}

            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
              type="email"
              autoComplete="email"
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth loading={loading} mt="sm">
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
