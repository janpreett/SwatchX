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
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconMail, IconLock } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const form = useForm<SignupFormData>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
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
      agreeToTerms: (value) => {
        if (!value) return 'You must agree to the terms and privacy policy';
        return null;
      },
    },
  });

  const handleSubmit = async (values: SignupFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await signup(values.email, values.password, values.confirmPassword);
      // Show success message and redirect to login after 2 seconds
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
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
      bg="gray.0"
    >
      <Container size="xs" w="100%">
        <Stack align="center" gap="xl">
          {/* Brand Logo - Mobile */}
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
          
          {/* Brand Logo - Desktop */}
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

          {/* Signup Form */}
          <Paper 
            withBorder 
            shadow="md" 
            p={{ base: 'md', sm: 'xl' }}
            radius="md" 
            w="100%" 
            maw={400}
          >
            <Stack gap="lg">
              {success ? (
                // Success state
                <Stack gap="lg" align="center" ta="center">
                  <div style={{ fontSize: '3rem', color: 'var(--mantine-color-green-6)' }}>
                    ✓
                  </div>
                  <Stack gap="xs">
                    <Title order={2} fw={600} c="green">
                      Account Created Successfully!
                    </Title>
                    <Text size="sm" c="dimmed">
                      Welcome to SwatchX! You will be redirected to the login page in a moment.
                    </Text>
                  </Stack>
                </Stack>
              ) : (
                // Signup form
                <>
                  <Stack gap="xs" ta="center">
                    <Title order={2} fw={600}>
                      Create Account
                    </Title>
                    <Text size="sm" c="dimmed">
                      Join SwatchX today
                    </Text>
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
                        placeholder="your@email.com"
                        leftSection={<IconMail size="1rem" />}
                        size="md"
                        radius="md"
                        required
                        {...form.getInputProps('email')}
                      />

                      <PasswordInput
                        label="Password"
                        placeholder="Create password"
                        leftSection={<IconLock size="1rem" />}
                        size="md"
                        radius="md"
                        required
                        {...form.getInputProps('password')}
                      />

                      <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm password"
                        leftSection={<IconLock size="1rem" />}
                        size="md"
                        radius="md"
                        required
                        {...form.getInputProps('confirmPassword')}
                      />

                      {/* THIS IS THE TERMS & PRIVACY CHECKBOX - THE FEATURE YOU'RE LOOKING FOR */}
                      <Checkbox
                        mt="sm"
                        label={
                          <Text size="sm">
                            I agree to the{' '}
                            <Anchor href="#" size="sm" c="blue" fw={500}>
                              Terms of Service
                            </Anchor>{' '}
                            and{' '}
                            <Anchor href="#" size="sm" c="blue" fw={500}>
                              Privacy Policy
                            </Anchor>
                          </Text>
                        }
                        required
                        {...form.getInputProps('agreeToTerms', { type: 'checkbox' })}
                      />

                      <Button 
                        type="submit" 
                        fullWidth 
                        loading={loading} 
                        size="md"
                        radius="md"
                        mt="sm"
                      >
                        Create Account
                      </Button>
                    </Stack>
                  </form>

                  <Text ta="center" size="sm" c="dimmed">
                    Already have an account?{' '}
                    <Anchor component={Link} to="/login" fw={500} c="blue">
                      Sign in
                    </Anchor>
                  </Text>
                </>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Flex>
  );
}
