import { AppShell, Group, Text, Avatar, Menu, UnstyledButton, Container } from '@mantine/core';
import { IconLogout, IconUser, IconChevronDown, IconSettings, IconUserCircle } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell 
      header={{ height: 60 }} 
      footer={{ height: 60 }} 
      padding="md"
    >
      <AppShell.Header>
        <Container fluid h="100%">
          <Group h="100%" justify="space-between" px="md">
            {/* Logo/Brand */}
            <Group>
              <Text 
                size="xl"
                fw={700} 
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                hiddenFrom="sm"
              >
                SwatchX
              </Text>
              <Text 
                size="2rem"
                fw={700} 
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                visibleFrom="sm"
              >
                SwatchX
              </Text>
            </Group>

            {/* User Menu */}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={7}>
                    <Avatar size={32} radius="xl" color="blue">
                      <IconUser size="1rem" />
                    </Avatar>
                    <Text fw={500} size="sm" lh={1} mr={3} visibleFrom="sm">
                      {user?.email}
                    </Text>
                    <IconChevronDown size="0.8rem" stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUserCircle size="0.9rem" stroke={1.5} />}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size="0.9rem" stroke={1.5} />}>
                  Settings
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item 
                  color="red"
                  leftSection={<IconLogout size="0.9rem" stroke={1.5} />}
                  onClick={handleLogout}
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        {children}
      </AppShell.Main>

      <AppShell.Footer>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
