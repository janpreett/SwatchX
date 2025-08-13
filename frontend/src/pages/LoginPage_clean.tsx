import { Container, Paper, Title, TextInput, PasswordInput, Button, Stack, Alert, Anchor, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconAlertCircle } from '@tabler/icons-react';
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
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="md" p="xl" radius="md" maw={400} mx="auto">
        <Stack gap="lg">
          <Title order={2} ta="center">
            Sign In
          </Title>

          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter password"
                required
                {...form.getInputProps('password')}
              />

              <Button type="submit" fullWidth loading={loading} mt="md">
                Sign In
              </Button>
            </Stack>
          </form>

          <Text ta="center" size="sm">
            Don't have an account?{' '}
            <Anchor component={Link} to="/signup">
              Create account
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
