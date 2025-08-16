import { AppShell, Group, Text, Avatar, Menu, UnstyledButton, Container } from '@mantine/core';
import { IconLogout, IconUser, IconChevronDown, IconSettings, IconUserCircle } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Footer } from './Footer';
import { useThemeColors } from '../hooks/useThemeColors';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const themeColors = useThemeColors();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
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
                {...themeColors.getGradientOrSolid({ from: 'blue', to: 'cyan', deg: 90 })}
                hiddenFrom="sm"
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundSize: '200% 100%',
                  backgroundPosition: '0% 50%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundPosition = '100% 50%';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = '0% 50%';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => navigate('/home')}
              >
                SwatchX
              </Text>
              <Text 
                size="2rem"
                fw={700} 
                variant="gradient"
                {...themeColors.getGradientOrSolid({ from: 'blue', to: 'cyan', deg: 90 })}
                visibleFrom="sm"
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundSize: '200% 100%',
                  backgroundPosition: '0% 50%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundPosition = '100% 50%';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = '0% 50%';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => navigate('/home')}
              >
                SwatchX
              </Text>
            </Group>

            {/* User Menu */}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={7}>
                    <Avatar 
                      size={32} 
                      radius="xl" 
                      color="blue"
                      style={{
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 2px 8px var(--mantine-color-blue-3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <IconUser size="1rem" />
                    </Avatar>
                    <Text 
                      fw={500} 
                      size="sm" 
                      lh={1} 
                      mr={3} 
                      visibleFrom="sm" 
                      c={themeColors.primaryText}
                      style={{
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--mantine-color-blue-6)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = themeColors.primaryText;
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {user?.name || user?.email}
                    </Text>
                    <IconChevronDown 
                      size="0.8rem" 
                      stroke={1.5}
                      style={{
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--mantine-color-blue-6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'inherit';
                      }}
                    />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item 
                  leftSection={<IconUserCircle size="0.9rem" stroke={1.5} />}
                  onClick={handleProfileClick}
                >
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size="0.9rem" stroke={1.5} />} onClick={handleSettingsClick}>
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
