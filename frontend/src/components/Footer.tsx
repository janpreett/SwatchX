import { Container, Group, Text, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';

export function Footer() {
  const themeColors = useThemeColors();
  
  return (
    <Container fluid h="100%" py="xs">
      <Container size="lg">
        <Group justify="space-between" align="center" h="100%">
          <Text size="sm" c={themeColors.secondaryText}>
            © 2025 SwatchX. All rights reserved.
          </Text>
          
          <Group gap="sm" visibleFrom="sm">
            <Anchor component={Link} to="/privacy" size="sm" c={themeColors.secondaryText} underline="hover">
              Privacy Policy
            </Anchor>
            <Anchor component={Link} to="/terms" size="sm" c={themeColors.secondaryText} underline="hover">
              Terms of Service
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Container>
  );
}
