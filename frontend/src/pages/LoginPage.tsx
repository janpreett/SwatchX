import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, Stack, Alert, Anchor, Flex } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconAlertCircle, IconMail, IconLock } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useThemeColors } from '../hooks/useThemeColors';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const themeColors = useThemeColors();

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex 
      mih="100vh" 
      align="center" 
      justify="center" 
      p={{ base: 'md', sm: 'xl' }}
    >
      <Container size="xs" w="100%">
        <Stack align="center" gap="xl">
          {/* Brand Logo */}
          <Text 
            size="2.5rem"
            fw={700}
            ta="center" 
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            hiddenFrom="sm"
          >
            SwatchX
          </Text>
          
          <Text 
            size="3rem"
            fw={700}
            ta="center" 
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            visibleFrom="sm"
          >
            SwatchX
          </Text>

          {/* Login Form */}
          <Paper 
            withBorder 
            shadow="md" 
            p={{ base: 'md', sm: 'xl' }}
            radius="md" 
            w="100%" 
            maw={400}
          >
            <Stack gap="lg">
              <Stack gap="xs" ta="center">
                <Title order={2} fw={600}>
                  Sign In
                </Title>
              </Stack>

              {error && (
                <Alert 
                  icon={<IconAlertCircle size="1rem" />} 
                  color="red" 
                  variant="light"
                  radius="md"
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    leftSection={<IconMail size="1rem" />}
                    size="md"
                    radius="md"
                    required
                    {...form.getInputProps('email')}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    leftSection={<IconLock size="1rem" />}
                    size="md"
                    radius="md"
                    required
                    {...form.getInputProps('password')}
                  />

                  {/* Forgot password link */}
                  <Anchor 
                    component={Link}
                    to="/forgot-password"
                    size="sm" 
                    ta="right" 
                    underline="hover"
                  >
                    Forgot password?
                  </Anchor>

                  <Button 
                    type="submit" 
                    fullWidth 
                    loading={loading} 
                    size="md"
                    radius="md"
                    mt="sm"
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>

              <Text ta="center" size="sm" c={themeColors.secondaryText}>
                Don't have an account?{' '}
                <Anchor component={Link} to="/signup" fw={500}>
                  Create account
                </Anchor>
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Flex>
  );
}
