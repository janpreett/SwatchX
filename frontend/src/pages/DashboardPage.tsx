import { Container, Title, Text, Button, Paper, Group, Box, Stack, Avatar, Badge } from '@mantine/core';
import { IconLogout, IconUser, IconMail, IconBrandReact } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box mih="100vh" bg="gray.0">
      <Container size="lg" py="xl">
        {/* Header Section */}
        <Paper withBorder shadow="lg" p="xl" radius="lg" mb="xl" bg="white">
          <Group justify="space-between" align="center">
            <Group>
              <Avatar 
                size="lg" 
                radius="xl" 
                variant="light"
                color="blue"
              >
                <IconUser size={24} />
              </Avatar>
              <Box>
                <Title order={2} c="dark.8" fw={700}>
                  Welcome to SwatchX
                </Title>
                <Group gap="xs" mt={4}>
                  <IconMail size={16} color="gray" />
                  <Text c="dimmed" size="sm">
                    {user?.email}
                  </Text>
                  <Badge variant="light" color="green" size="sm">
                    Active
                  </Badge>
                </Group>
              </Box>
            </Group>
            
            <Button
              variant="light"
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </Group>
        </Paper>

        {/* Welcome Card */}
        <Paper withBorder shadow="md" p="xl" radius="lg" bg="white">
          <Stack gap="lg">
            <Group gap="md">
              <IconBrandReact size={32} color="#61DAFB" />
              <Title order={3} c="dark.7">
                🚀 Your SwatchX Dashboard
              </Title>
            </Group>

            <Text c="dimmed" size="md" lh={1.6}>
              Congratulations! You've successfully set up your full-stack SwatchX application 
              with React, Mantine, and FastAPI. Your authentication system is working perfectly.
            </Text>

            <Paper bg="blue.0" p="md" radius="md" mt="md">
              <Group gap="md" align="center">
                <Avatar 
                  size={40}
                  radius="xl"
                  bg="blue.6"
                  color="white"
                >
                  ✓
                </Avatar>
                <Box>
                  <Text fw={600} c="blue.7">
                    Authentication System Ready
                  </Text>
                  <Text size="sm" c="dimmed">
                    JWT tokens, password hashing, and secure routes are all configured
                  </Text>
                </Box>
              </Group>
            </Paper>

            <Group mt="lg">
              <Button variant="filled" size="sm">
                Get Started
              </Button>
              <Button variant="light" size="sm">
                View Documentation
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
