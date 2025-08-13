import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Alert,
  Stack,
  Anchor,
  Box,
  Flex,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle, IconLogin } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Please enter a valid email address';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        return null;
      },
    },
  });

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await login(values.email, values.password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      mih="100vh"
      w="100vw"
      align="center"
      justify="center"
      bg="gray.0"
      p="md"
    >
      <Container size="xs" w="100%">
        <Paper 
          withBorder 
          shadow="xl" 
          p="xl" 
          radius="lg"
          w="100%"
          maw={420}
          mx="auto"
          bg="white"
        >
          <Title
            order={2}
            ta="center"
            mb="lg"
            fw={700}
            c="dark.8"
          >
            Welcome to SwatchX
          </Title>
          
          <Text 
            c="dimmed" 
            size="sm" 
            ta="center" 
            mb="xl"
          >
            Don't have an account?{' '}
            <Anchor 
              component={Link} 
              to="/signup" 
              fw={500}
            >
              Create one here
            </Anchor>
          </Text>

          {error && (
            <Alert 
              icon={<IconInfoCircle size={16} />} 
              color="red" 
              mb="lg"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email Address"
                placeholder="Enter your email"
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                required
                {...form.getInputProps('password')}
              />

              <Box ta="right">
                <Anchor 
                  component={Link}
                  to="/forgot-password"
                  size="sm"
                  c="blue.6"
                >
                  Forgot password?
                </Anchor>
              </Box>

              <Button
                type="submit"
                size="md"
                fullWidth
                mt="md"
                loading={loading}
                leftSection={<IconLogin size={16} />}
                variant="filled"
              >
                Sign In
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Flex>
  );
}
