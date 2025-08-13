import { Container, Group, Text, Anchor } from '@mantine/core';

export function Footer() {
  return (
    <Container fluid py="md" mt="xl" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
      <Container size="lg">
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            © 2025 SwatchX. All rights reserved.
          </Text>
          
          <Group gap="lg">
            <Anchor size="sm" c="dimmed" href="#" underline="hover">
              Privacy Policy
            </Anchor>
            <Anchor size="sm" c="dimmed" href="#" underline="hover">
              Terms of Service
            </Anchor>
            <Anchor size="sm" c="dimmed" href="#" underline="hover">
              Support
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Container>
  );
}
