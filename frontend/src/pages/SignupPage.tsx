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
  Flex,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle, IconUserPlus } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const form = useForm<SignupFormData>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Please enter a valid email address';
        if (value.length > 254) return 'Email is too long';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (value.length > 128) return 'Password is too long';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character (@$!%*?&)';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
    },
  });

  const handleSubmit = async (values: SignupFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await signup(values.email, values.password, values.confirmPassword);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
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
            Create Your Account
          </Title>
          
          <Text 
            c="dimmed" 
            size="sm" 
            ta="center" 
            mb="xl"
          >
            Already have an account?{' '}
            <Anchor 
              component={Link} 
              to="/login" 
              fw={500}
            >
              Sign in here
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
                placeholder="Create a strong password"
                required
                {...form.getInputProps('password')}
                description="Must be 8+ characters with uppercase, lowercase, number, and special character"
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                {...form.getInputProps('confirmPassword')}
              />

              <Button
                type="submit"
                size="md"
                fullWidth
                mt="md"
                loading={loading}
                leftSection={<IconUserPlus size={16} />}
                variant="filled"
                color="blue"
              >
                Create Account
              </Button>

              <Text size="xs" c="dimmed" ta="center" mt="md">
                By creating an account, you agree to our{' '}
                <Anchor href="#" size="xs">
                  Terms of Service
                </Anchor>{' '}
                and{' '}
                <Anchor href="#" size="xs">
                  Privacy Policy
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Flex>
  );
}
