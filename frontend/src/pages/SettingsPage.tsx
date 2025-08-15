import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  Box,
  ActionIcon,
  Card,
  SegmentedControl,
} from '@mantine/core';
import { IconArrowLeft, IconMoon, IconSun, IconPalette } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useTheme } from '../hooks/useTheme';
import { useThemeColors } from '../hooks/useThemeColors';
import type { ThemeMode } from '../contexts/ThemeContext';
import { notifications } from '@mantine/notifications';

export function SettingsPage() {
  const navigate = useNavigate();
  const { themeMode, setThemeMode } = useTheme();
  const themeColors = useThemeColors();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate('/home');
  };

  const handleThemeChange = async (newMode: string) => {
    const mode = newMode as ThemeMode;
    setLoading(true);
    
    try {
      setThemeMode(mode);
      
      const modeLabels = {
        'light': 'light mode',
        'dark': 'dark mode',
      };
      
      const modeIcons = {
        'light': <IconSun size="1rem" />,
        'dark': <IconMoon size="1rem" />,
      };
      
      // Show success notification
      notifications.show({
        title: 'Theme Updated!',
        message: `Switched to ${modeLabels[mode]} successfully.`,
        color: 'blue',
        icon: modeIcons[mode],
        autoClose: 3000,
        withCloseButton: true
      });
    } catch (error) {
      // This shouldn't happen for theme switching, but good to have error handling
      console.error('Theme toggle error:', error);
      
      notifications.show({
        title: 'Theme Update Failed',
        message: 'There was an issue switching themes. Please try again.',
        color: 'red',
        autoClose: 5000,
        withCloseButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container size="md" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group gap="md">
            <ActionIcon variant="light" size="lg" onClick={handleBack}>
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Box>
              <Title order={1}>Settings</Title>
              <Text c={themeColors.secondaryText}>Customize your SwatchX experience</Text>
            </Box>
          </Group>

          {/* Appearance Settings */}
          <Card withBorder shadow="sm" padding="xl" radius="md">
            <Stack gap="md">
              <Group gap="sm">
                <IconPalette size={20} />
                <Title order={3}>Appearance</Title>
              </Group>
              
              <Text size="sm" c={themeColors.secondaryText}>
                Customize how SwatchX looks and feels across the application.
              </Text>

              {/* Theme Mode Selector */}
              <Group justify="space-between" align="flex-start">
                <Group gap="md">
                  {themeMode === 'light' && <IconSun size={20} />}
                  {themeMode === 'dark' && <IconMoon size={20} />}
                  <Box>
                    <Text fw={500} size="sm">Theme Mode</Text>
                    <Text size="xs" c={themeColors.secondaryText}>
                      {themeMode === 'light' && 'Currently using light theme with standard brightness'}
                      {themeMode === 'dark' && 'Currently using dark theme with jet black background and high contrast'}
                    </Text>
                  </Box>
                </Group>
                
                <SegmentedControl
                  value={themeMode}
                  onChange={handleThemeChange}
                  disabled={loading}
                  size="sm"
                  data={[
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                  ]}
                />
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
