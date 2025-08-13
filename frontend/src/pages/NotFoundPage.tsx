import { Title, Text, Button, Stack, Paper } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PageLayout showBrand={false}>
      <Paper withBorder shadow="md" p="xl" radius="md" w="100%">
        <Stack gap="lg" ta="center">
          <Title order={1} size="4rem" c="dimmed">
            404
          </Title>
          
          <Stack gap="xs">
            <Title order={2}>
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
          >
            Back to Home
          </Button>
        </Stack>
      </Paper>
    </PageLayout>
  );
}
