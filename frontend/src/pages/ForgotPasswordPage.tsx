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
  Stepper,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconMail, IconLock, IconArrowLeft } from '@tabler/icons-react';
import { authService } from '../services/auth';

interface SecurityQuestions {
  question_1: string;
  question_2: string;
  question_3: string;
  has_security_questions: boolean;
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestions | null>(null);
  const [success, setSuccess] = useState(false);

  const emailForm = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
        return null;
      }
    }
  });

  const resetForm = useForm({
    initialValues: {
      email: '',
      answers: ['', '', ''],
      new_password: '',
      confirm_password: ''
    },
    validate: {
      new_password: (value: string) => {
        if (!value) return 'New password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
        return null;
      },
      confirm_password: (value: string, values: { new_password: string }) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.new_password) return 'Passwords do not match';
        return null;
      }
    }
  });

  const handleEmailSubmit = async (values: { email: string }) => {
    setLoading(true);
    setError('');

    try {
      const data = await authService.requestPasswordReset(values.email);
      setSecurityQuestions(data);
      resetForm.setFieldValue('email', values.email);
      setCurrentStep(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (values: { 
    email: string; 
    answers: string[]; 
    new_password: string; 
    confirm_password: string;
  }) => {
    setLoading(true);
    setError('');

    // Validate answers
    if (!values.answers[0] || !values.answers[1] || !values.answers[2]) {
      setError('Please answer all security questions');
      setLoading(false);
      return;
    }

    try {
      await authService.verifyPasswordReset({
        email: values.email,
        answers: values.answers,
        new_password: values.new_password,
        confirm_password: values.confirm_password
      });
      setSuccess(true);
      setCurrentStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <Flex 
        mih="100vh" 
        align="center" 
        justify="center" 
        p={{ base: 'md', sm: 'xl' }}
      >
        <Container size="xs" w="100%">
          <Stack align="center" gap="xl">
            <Text 
              size="2.5rem"
              fw={700}
              ta="center" 
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            >
              SwatchX
            </Text>
            
            <Paper withBorder shadow="md" p="xl" radius="md" w="100%" maw={400}>
              <Stack gap="lg" ta="center">
                <Stack gap="xs">
                  <Title order={2} c="green">Password Reset Successful!</Title>
                  <Text c="dimmed">
                    Your password has been reset successfully. You can now log in with your new password.
                  </Text>
                </Stack>
                
                <Button 
                  fullWidth 
                  size="md"
                  radius="md"
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Flex>
    );
  }

  return (
    <Flex 
      mih="100vh" 
      align="center" 
      justify="center" 
      p={{ base: 'md', sm: 'xl' }}
    >
      <Container size="sm" w="100%">
        <Stack align="center" gap="xl">
          <Text 
            size="2.5rem"
            fw={700}
            ta="center" 
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
          >
            SwatchX
          </Text>

          <Paper withBorder shadow="md" p="xl" radius="md" w="100%" maw={500}>
            <Stack gap="lg">
              <Group gap="sm">
                <Button
                  variant="subtle"
                  size="sm"
                  leftSection={<IconArrowLeft size="1rem" />}
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </Button>
              </Group>

              <Stepper active={currentStep} size="sm">
                <Stepper.Step label="Email" description="Enter your email">
                  <Stack gap="md" mt="md">
                    <Stack gap="xs" ta="center">
                      <Title order={2} fw={600}>Reset Password</Title>
                      <Text size="sm" c="dimmed">
                        Enter your email address to get your security questions
                      </Text>
                    </Stack>

                    {error && (
                      <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                        {error}
                      </Alert>
                    )}

                    <form onSubmit={emailForm.onSubmit(handleEmailSubmit)}>
                      <Stack gap="md">
                        <TextInput
                          label="Email Address"
                          placeholder="your@email.com"
                          leftSection={<IconMail size="1rem" />}
                          size="md"
                          required
                          {...emailForm.getInputProps('email')}
                        />

                        <Button 
                          type="submit" 
                          fullWidth 
                          loading={loading} 
                          size="md"
                        >
                          Get Security Questions
                        </Button>
                      </Stack>
                    </form>
                  </Stack>
                </Stepper.Step>

                <Stepper.Step label="Security Questions" description="Answer your questions">
                  <Stack gap="md" mt="md">
                    <Stack gap="xs" ta="center">
                      <Title order={3} fw={600}>Answer Security Questions</Title>
                      <Text size="sm" c="dimmed">
                        Please answer all security questions to reset your password
                      </Text>
                    </Stack>

                    {error && (
                      <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                        {error}
                      </Alert>
                    )}

                    {securityQuestions && (
                      <form onSubmit={resetForm.onSubmit(handleResetSubmit)}>
                        <Stack gap="md">
                          <Stack gap="sm">
                            <Text fw={500} size="sm">Question 1:</Text>
                            <Text size="sm" c="dimmed">{securityQuestions.question_1}</Text>
                            <TextInput
                              placeholder="Your answer"
                              required
                              {...resetForm.getInputProps('answers.0')}
                            />
                          </Stack>

                          <Stack gap="sm">
                            <Text fw={500} size="sm">Question 2:</Text>
                            <Text size="sm" c="dimmed">{securityQuestions.question_2}</Text>
                            <TextInput
                              placeholder="Your answer"
                              required
                              {...resetForm.getInputProps('answers.1')}
                            />
                          </Stack>

                          <Stack gap="sm">
                            <Text fw={500} size="sm">Question 3:</Text>
                            <Text size="sm" c="dimmed">{securityQuestions.question_3}</Text>
                            <TextInput
                              placeholder="Your answer"
                              required
                              {...resetForm.getInputProps('answers.2')}
                            />
                          </Stack>

                          <PasswordInput
                            label="New Password"
                            placeholder="Enter your new password"
                            leftSection={<IconLock size="1rem" />}
                            required
                            {...resetForm.getInputProps('new_password')}
                          />

                          <PasswordInput
                            label="Confirm New Password"
                            placeholder="Confirm your new password"
                            leftSection={<IconLock size="1rem" />}
                            required
                            {...resetForm.getInputProps('confirm_password')}
                          />

                          <Button 
                            type="submit" 
                            fullWidth 
                            loading={loading} 
                            size="md"
                          >
                            Reset Password
                          </Button>
                        </Stack>
                      </form>
                    )}
                  </Stack>
                </Stepper.Step>
              </Stepper>

              <Text ta="center" size="sm" c="dimmed" mt="md">
                Remember your password?{' '}
                <Anchor component={Link} to="/login" fw={500} c="blue">
                  Back to Login
                </Anchor>
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Flex>
  );
}
