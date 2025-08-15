import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Alert,
  Stack,
  Group,
  Box,
  ActionIcon,
  Card,
  Anchor,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconAlertCircle, IconShield, IconLock, IconUser } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';

interface SecurityQuestion {
  question: string;
  answer: string;
}

interface SecurityQuestionsData {
  question_1?: string;
  question_2?: string;
  question_3?: string;
  has_security_questions: boolean;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const COMMON_SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was the name of your elementary school?",
  "What is your favorite movie?",
  "What was your first job?",
  "What is your favorite food?",
  "What was the make of your first car?",
  "What is your favorite book?",
  "What was your childhood nickname?",
  "What street did you grow up on?",
  "What is your father's middle name?",
  "What was your favorite subject in school?",
  "What is the name of your best friend from childhood?",
  "What was your favorite vacation destination?"
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestionsData | null>(null);
  
  // Security Questions Form
  const securityForm = useForm<{ questions: SecurityQuestion[] }>({
    initialValues: {
      questions: [
        { question: '', answer: '' },
        { question: '', answer: '' },
        { question: '', answer: '' }
      ]
    },
    validate: {
      questions: {
        question: (value) => {
          if (!value || value.length < 10) return 'Question must be at least 10 characters long';
          return null;
        },
        answer: (value) => {
          if (!value || value.length < 2) return 'Answer must be at least 2 characters long';
          return null;
        }
      }
    }
  });

  // Password Change Form
  const passwordForm = useForm<PasswordChangeData>({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    },
    validate: {
      current_password: (value) => {
        if (!value) return 'Current password is required';
        return null;
      },
      new_password: (value) => {
        if (!value) return 'New password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
        return null;
      },
      confirm_password: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.new_password) return 'Passwords do not match';
        return null;
      }
    }
  });

  // Load existing security questions
  useEffect(() => {
    const loadSecurityQuestions = async () => {
      try {
        const data = await authService.getSecurityQuestions();
        setSecurityQuestions(data);
        
        if (data.has_security_questions) {
          securityForm.setValues({
            questions: [
              { question: data.question_1 || '', answer: '' },
              { question: data.question_2 || '', answer: '' },
              { question: data.question_3 || '', answer: '' }
            ]
          });
        }
      } catch (error) {
        console.error('Failed to load security questions:', error);
      }
    };

    loadSecurityQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSecurityQuestionsSubmit = async (values: { questions: SecurityQuestion[] }) => {
    setLoading(true);
    setError('');

    // Check for duplicate questions
    const questions = values.questions.map(q => q.question.toLowerCase());
    const uniqueQuestions = new Set(questions);
    if (uniqueQuestions.size !== questions.length) {
      setError('All security questions must be unique');
      setLoading(false);
      return;
    }

    try {
      if (securityQuestions?.has_security_questions) {
        await authService.updateSecurityQuestions(values.questions);
        notifications.show({
          title: 'Success!',
          message: 'Security questions updated successfully',
          color: 'green'
        });
      } else {
        await authService.setupSecurityQuestions(values.questions);
        notifications.show({
          title: 'Success!',
          message: 'Security questions set up successfully',
          color: 'green'
        });
      }
      
      // Refresh security questions data
      const data = await authService.getSecurityQuestions();
      setSecurityQuestions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save security questions');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (values: PasswordChangeData) => {
    setLoading(true);
    setError('');

    try {
      await authService.changePassword(values);
      notifications.show({
        title: 'Success!',
        message: 'Password changed successfully',
        color: 'green'
      });
      passwordForm.reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Container size="md" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group gap="md">
            <ActionIcon variant="light" size="lg" onClick={handleBack}>
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Box>
              <Title order={1}>Profile Settings</Title>
              <Text c="dimmed">Manage your account and security settings</Text>
            </Box>
          </Group>

          {/* Account Information */}
          <Card withBorder shadow="sm" padding="xl" radius="md">
            <Stack gap="md">
              <Group gap="sm">
                <IconUser size={20} />
                <Title order={3}>Account Information</Title>
              </Group>
              
              <TextInput
                label="Email Address"
                value={user.email}
                disabled
                leftSection={<IconUser size="1rem" />}
                description="Your email address cannot be changed"
              />
            </Stack>
          </Card>

          {/* Password Change */}
          <Card withBorder shadow="sm" padding="xl" radius="md">
            <Stack gap="md">
              <Group gap="sm">
                <IconLock size={20} />
                <Title order={3}>Change Password</Title>
              </Group>
              
              {error && (
                <Alert 
                  icon={<IconAlertCircle size="1rem" />} 
                  color="red" 
                  variant="light"
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={passwordForm.onSubmit(handlePasswordChangeSubmit)}>
                <Stack gap="md">
                  <PasswordInput
                    label="Current Password"
                    placeholder="Enter your current password"
                    required
                    {...passwordForm.getInputProps('current_password')}
                  />

                  <PasswordInput
                    label="New Password"
                    placeholder="Enter your new password"
                    required
                    {...passwordForm.getInputProps('new_password')}
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    required
                    {...passwordForm.getInputProps('confirm_password')}
                  />

                  <Button 
                    type="submit" 
                    loading={loading}
                    leftSection={<IconLock size="1rem" />}
                  >
                    Change Password
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Card>

          {/* Security Questions */}
          <Card withBorder shadow="sm" padding="xl" radius="md">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group gap="sm">
                  <IconShield size={20} />
                  <Title order={3}>Security Questions</Title>
                </Group>
                <Anchor component={Link} to="/security-help" size="sm">
                  Need help choosing questions?
                </Anchor>
              </Group>
              
              <Text size="sm" c="dimmed">
                Security questions help you reset your password if you forget it. Choose questions only you would know the answer to.
                Avoid questions with answers that might be found on social media or public records.
              </Text>

              <form onSubmit={securityForm.onSubmit(handleSecurityQuestionsSubmit)}>
                <Stack gap="md">
                  {securityForm.values.questions.map((_, index) => (
                    <Box key={index}>
                      <Text fw={500} size="sm" mb="xs">
                        Security Question {index + 1}
                      </Text>
                      
                      <Stack gap="sm">
                        <TextInput
                          label="Question"
                          placeholder="Choose a security question"
                          required
                          {...securityForm.getInputProps(`questions.${index}.question`)}
                        />
                        
                        <Text size="xs" c="dimmed">
                          Suggestions: {COMMON_SECURITY_QUESTIONS.slice(index * 5, (index + 1) * 5).join(' • ')}
                        </Text>

                        <PasswordInput
                          label="Answer"
                          placeholder="Enter your answer"
                          required
                          {...securityForm.getInputProps(`questions.${index}.answer`)}
                          description="Answers are case-insensitive"
                        />
                      </Stack>
                      
                      {index < 2 && <Divider my="md" />}
                    </Box>
                  ))}

                  <Button 
                    type="submit" 
                    loading={loading}
                    leftSection={<IconShield size="1rem" />}
                  >
                    {securityQuestions?.has_security_questions ? 'Update' : 'Set Up'} Security Questions
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
