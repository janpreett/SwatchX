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
  Modal,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconAlertCircle, IconShield, IconLock, IconUser, IconEdit } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';

interface SecurityQuestion {
  question: string;
  answer: string;
  current_password: string;
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
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  
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

  // Individual Security Question Form
  const questionForm = useForm<SecurityQuestion>({
    initialValues: {
      question: '',
      answer: '',
      current_password: ''
    },
    validate: {
      question: (value) => {
        if (!value || value.length < 10) return 'Question must be at least 10 characters long';
        return null;
      },
      answer: (value) => {
        if (!value || value.length < 2) return 'Answer must be at least 2 characters long';
        return null;
      },
      current_password: (value) => {
        if (!value) return 'Current password is required to modify security questions';
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
      } catch (error) {
        console.error('Failed to load security questions:', error);
      }
    };

    loadSecurityQuestions();
  }, []);

  const handlePasswordChangeSubmit = async (values: PasswordChangeData) => {
    setLoading(true);
    setError('');

    try {
      await authService.changePassword(values);
      
      // Show success notification
      notifications.show({
        title: 'Password Changed Successfully!',
        message: 'Your password has been updated. Please use your new password for future logins.',
        color: 'green',
        icon: <IconLock size="1rem" />,
        autoClose: 5000,
        withCloseButton: true
      });
      
      passwordForm.reset();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      
      notifications.show({
        title: 'Password Change Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
        autoClose: 5000,
        withCloseButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (index: number) => {
    const questions = [
      securityQuestions?.question_1 || '',
      securityQuestions?.question_2 || '',
      securityQuestions?.question_3 || ''
    ];
    
    questionForm.setValues({
      question: questions[index],
      answer: '',
      current_password: ''
    });
    
    setEditingQuestion(index);
  };

  const handleSaveQuestion = async (values: SecurityQuestion) => {
    if (editingQuestion === null) return;
    
    setLoading(true);
    setError('');

    try {
      // Use the new individual question update API
      await authService.updateIndividualSecurityQuestion({
        question: values.question,
        answer: values.answer,
        current_password: values.current_password,
        question_index: editingQuestion
      });

      notifications.show({
        title: 'Security Question Updated!',
        message: `Security question ${editingQuestion + 1} has been updated successfully.`,
        color: 'green',
        icon: <IconShield size="1rem" />,
        autoClose: 5000,
        withCloseButton: true
      });

      // Refresh security questions data
      const data = await authService.getSecurityQuestions();
      setSecurityQuestions(data);
      setEditingQuestion(null);
      questionForm.reset();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save security question';
      setError(errorMessage);
      
      notifications.show({
        title: 'Update Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
        autoClose: 5000,
        withCloseButton: true
      });
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

  const questions = [
    securityQuestions?.question_1 || '',
    securityQuestions?.question_2 || '',
    securityQuestions?.question_3 || ''
  ];

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
                  {securityQuestions?.has_security_questions && (
                    <Badge color="green" variant="light" size="sm">
                      Set up
                    </Badge>
                  )}
                </Group>
                <Anchor component={Link} to="/security-help" size="sm">
                  Need help choosing questions?
                </Anchor>
              </Group>
              
              <Text size="sm" c="dimmed">
                Security questions help you reset your password if you forget it. Click "Edit" to update individual questions.
              </Text>

              <Stack gap="lg">
                {[0, 1, 2].map((index) => (
                  <Card key={index} withBorder p="md" radius="sm" bg="gray.0">
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text fw={500} size="sm">Security Question {index + 1}</Text>
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconEdit size="0.8rem" />}
                          onClick={() => handleEditQuestion(index)}
                        >
                          Edit
                        </Button>
                      </Group>
                      
                      {questions[index] ? (
                        <Text size="sm" c="dimmed">{questions[index]}</Text>
                      ) : (
                        <Text size="sm" c="dimmed" fs="italic">
                          Click "Edit" to set up this security question
                        </Text>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>

      {/* Edit Question Modal */}
      <Modal
        opened={editingQuestion !== null}
        onClose={() => {
          setEditingQuestion(null);
          questionForm.reset();
          setError('');
        }}
        title={`Edit Security Question ${editingQuestion !== null ? editingQuestion + 1 : ''}`}
        size="md"
      >
        {error && (
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            color="red" 
            variant="light"
            mb="md"
          >
            {error}
          </Alert>
        )}
        
        <form onSubmit={questionForm.onSubmit(handleSaveQuestion)}>
          <Stack gap="md">
            <TextInput
              label="Security Question"
              placeholder="Enter your security question"
              required
              {...questionForm.getInputProps('question')}
            />
            
            <Text size="xs" c="dimmed">
              Suggestions: {COMMON_SECURITY_QUESTIONS.slice(0, 5).join(' • ')}
            </Text>

            <PasswordInput
              label="Answer"
              placeholder="Enter your answer"
              required
              description="Answers are case-insensitive and will be encrypted"
              {...questionForm.getInputProps('answer')}
            />

            <PasswordInput
              label="Current Password"
              placeholder="Enter your current password to verify changes"
              required
              description="Required to modify security questions"
              {...questionForm.getInputProps('current_password')}
            />

            <Group justify="flex-end" gap="sm">
              <Button
                variant="light"
                onClick={() => {
                  setEditingQuestion(null);
                  questionForm.reset();
                  setError('');
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                leftSection={<IconShield size="1rem" />}
              >
                Save Question
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Layout>
  );
}
