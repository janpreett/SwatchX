import { Container, Group, Text, Anchor } from '@mantine/core';

export function Footer() {
  return (
    <Container fluid h="100%" py="xs">
      <Container size="lg">
        <Group justify="space-between" align="center" h="100%">
          <Text size="sm" c="dimmed">
            © 2025 SwatchX. All rights reserved.
          </Text>
          
          <Group gap="sm" visibleFrom="sm">
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
