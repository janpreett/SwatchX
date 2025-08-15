import { Container, Group, Text, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <Container fluid h="100%" py="xs">
      <Container size="lg">
        <Group justify="space-between" align="center" h="100%">
          <Text size="sm" c="dimmed">
            © 2025 SwatchX. All rights reserved.
          </Text>
          
          <Group gap="sm" visibleFrom="sm">
            <Anchor component={Link} to="/privacy" size="sm" c="dimmed" underline="hover">
              Privacy Policy
            </Anchor>
            <Anchor component={Link} to="/terms" size="sm" c="dimmed" underline="hover">
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
