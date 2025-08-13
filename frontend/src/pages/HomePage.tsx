import { Container, Text, Stack } from '@mantine/core';
import { Layout } from '../components/Layout';

export function HomePage() {
  return (
    <Layout>
      <Container size="lg" py={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg" align="center">
          <Text 
            size="3rem"
            ta="center" 
            fw={700}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
          >
            Welcome to SwatchX
          </Text>
        </Stack>
      </Container>
    </Layout>
  );
}
