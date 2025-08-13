import { Container, Stack, Text, Center } from '@mantine/core';
import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  showBrand?: boolean;
  maxWidth?: number;
}

export function PageLayout({ children, showBrand = true, maxWidth = 500 }: PageLayoutProps) {
  return (
    <Center mih="100vh" py="xl">
      <Container size="sm" px="md">
        <Stack align="center" gap="xl">
          {showBrand && (
            <Text 
              size="2.5rem"
              fw={700}
              ta="center" 
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            >
              SwatchX
            </Text>
          )}
          
          <Container size="xs" px={0} w="100%" maw={maxWidth}>
            {children}
          </Container>
        </Stack>
      </Container>
    </Center>
  );
}
