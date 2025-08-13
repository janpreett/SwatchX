import { Container, Title, Text, Button, Stack, Paper, Flex } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Flex mih="100vh" align="center" justify="center" p="md">
      <Container size="xs" w="100%">
        <Stack align="center" gap="xl">
          {/* Brand Logo */}
          <Text 
            size="2rem"
            fw={700}
            ta="center" 
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
          >
            SwatchX
          </Text>

          {/* 404 Content */}
          <Paper 
            withBorder 
            shadow="md" 
            p="xl" 
            radius="md" 
            w="100%" 
            maw={400}
          >
            <Stack gap="lg" ta="center">
              <Title order={1} size="4rem" c="dimmed" fw={600}>
                404
              </Title>
              
              <Stack gap="xs">
                <Title order={2} fw={600}>
                  Page Not Found
                </Title>
                <Text size="md" c="dimmed">
                  The page you're looking for doesn't exist.
                </Text>
              </Stack>

              <Button 
                leftSection={<IconArrowLeft size="1rem" />}
                onClick={() => navigate('/home')}
                variant="light"
                size="md"
                radius="md"
                fullWidth
                mt="md"
              >
                Back to Home
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Flex>
  );
}
