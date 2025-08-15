import { Container, Card, Title, Text, Stack, Group, Button, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

const SECURITY_QUESTION_SUGGESTIONS = [
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

export function SecurityQuestionsHelpPage() {
  return (
    <Layout>
      <Container size="md" py="xl">
        <Stack gap="xl">
          <Card withBorder shadow="sm" padding="xl" radius="md">
            <Stack gap="lg">
              <Group justify="space-between">
                <Title order={2}>Security Questions Help</Title>
                <Anchor component={Link} to="/profile" size="sm">
                  Back to Profile
                </Anchor>
              </Group>

              <Text>
                Security questions are used to verify your identity when you need to reset your password. 
                Choose questions that only you would know the answer to, and avoid questions with answers 
                that could be easily found on social media or through research.
              </Text>

              <Stack gap="md">
                <Title order={3} size="h4">Tips for choosing good security questions:</Title>
                <Text component="ul" pl="md">
                  <li>Choose questions with answers that won't change over time</li>
                  <li>Avoid questions with answers that are publicly available</li>
                  <li>Use answers that are easy for you to remember</li>
                  <li>Avoid questions with simple yes/no answers</li>
                  <li>Consider using creative answers that only make sense to you</li>
                </Text>
              </Stack>

              <Stack gap="md">
                <Title order={3} size="h4">Suggested Security Questions:</Title>
                <Stack gap="xs">
                  {SECURITY_QUESTION_SUGGESTIONS.map((question, index) => (
                    <Card key={index} withBorder p="sm" radius="sm">
                      <Text size="sm">{question}</Text>
                    </Card>
                  ))}
                </Stack>
              </Stack>

              <Stack gap="md">
                <Title order={3} size="h4">Examples of GOOD security questions:</Title>
                <Stack gap="xs" pl="md">
                  <Text size="sm" c="green.7">• "What was the name of your first pet?" (if you remember clearly)</Text>
                  <Text size="sm" c="green.7">• "What street did you live on when you were 10 years old?"</Text>
                  <Text size="sm" c="green.7">• "What was your favorite teacher's last name?"</Text>
                </Stack>
              </Stack>

              <Stack gap="md">
                <Title order={3} size="h4">Examples of BAD security questions:</Title>
                <Stack gap="xs" pl="md">
                  <Text size="sm" c="red.7">• "What is your favorite color?" (too easy to guess)</Text>
                  <Text size="sm" c="red.7">• "What high school did you attend?" (may be public information)</Text>
                  <Text size="sm" c="red.7">• "What year were you born?" (often public information)</Text>
                </Stack>
              </Stack>

              <Card withBorder p="md" radius="md" bg="blue.0">
                <Stack gap="sm">
                  <Title order={4} size="h5">Security Note:</Title>
                  <Text size="sm">
                    Your answers are encrypted and stored securely. Even SwatchX administrators cannot 
                    see your answers. Make sure to remember your answers exactly as you typed them, 
                    including capitalization and spacing.
                  </Text>
                </Stack>
              </Card>

              <Button 
                component={Link} 
                to="/profile" 
                size="lg"
                fullWidth
              >
                Set Up Security Questions
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
