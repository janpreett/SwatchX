import { Container, Title, Text, Stack, Paper, Group, Badge, Button } from '@mantine/core';
import { IconCheck, IconRocket } from '@tabler/icons-react';
import { Layout } from '../components/Layout';

export function HomePage() {
  return (
    <Layout>
      <Container size="lg" py="xl">
        <Stack gap="xl" align="center">
          {/* Welcome Section */}
          <Paper 
            withBorder 
            shadow="sm" 
            p="xl" 
            radius="md" 
            w="100%" 
            maw={600}
          >
            <Stack gap="lg" ta="center">
              <Title order={1} fw={600} c="blue">
                Welcome to SwatchX
              </Title>
              
              <Text size="lg" c="dimmed">
                You're successfully logged in to your SwatchX dashboard!
              </Text>

              <Group justify="center" gap="md">
                <Badge variant="light" color="green" size="lg" radius="md">
                  <IconCheck size="0.8rem" />
                  <Text ml="xs" span>Authentication Working</Text>
                </Badge>
                
                <Badge variant="light" color="blue" size="lg" radius="md">
                  <IconCheck size="0.8rem" />
                  <Text ml="xs" span>System Ready</Text>
                </Badge>
              </Group>

              <Button 
                leftSection={<IconRocket size="1rem" />}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                size="md"
                radius="md"
                mt="md"
              >
                Start Building Features
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Layout>
  );
}
