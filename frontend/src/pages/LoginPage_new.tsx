import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, Stack, Center, Alert, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconAlertCircle, IconLogin } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError('');
    
    try {
      await login(values.email, values.password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py={60}>
      <Center>
        <Stack gap="lg" w="100%" maw={400}>
          {/* Header */}
          <Stack gap="xs" ta="center">
            <Title order={1} fw={700}>
              Welcome back
            </Title>
            <Text c="dimmed" size="sm">
              Sign in to your SwatchX account
            </Text>
          </Stack>

          {/* Login Form */}
          <Paper withBorder shadow="md" p="xl" radius="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                {error && (
                  <Alert 
                    icon={<IconAlertCircle size="1rem" />}
                    color="red"
                    variant="light"
                  >
                    {error}
                  </Alert>
                )}

                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  size="md"
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  size="md"
                  {...form.getInputProps('password')}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  loading={loading}
                  leftSection={<IconLogin size="1rem" />}
                  mt="sm"
                >
                  Sign in
                </Button>
              </Stack>
            </form>
          </Paper>

          {/* Footer */}
          <Text ta="center" size="sm" c="dimmed">
            Don't have an account?{' '}
            <Anchor component={Link} to="/signup" fw={500}>
              Create account
            </Anchor>
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
