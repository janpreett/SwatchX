import { Container, Title, Text, Stack } from '@mantine/core';
import { Layout } from '../components/Layout';

export function HomePage() {
  return (
    <Layout>
      <Container size="lg" py="xl">
        <Stack gap="lg" align="center">
          <Title order={1} ta="center">
            Welcome to SwatchX
          </Title>
          
          <Text ta="center" size="lg" c="dimmed">
            You're successfully logged in!
          </Text>
        </Stack>
      </Container>
    </Layout>
  );
}
