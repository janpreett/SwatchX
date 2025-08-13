import { Container, Title, Text, Button, Paper, Group, Stack, Grid, Card, Badge, ThemeIcon, Center } from '@mantine/core';
import { IconHome, IconBrandReact, IconDatabase, IconShield, IconCheck, IconRocket } from '@tabler/icons-react';
import { Layout } from '../components/Layout';

export function HomePage() {
  return (
    <Layout>
      <Container size="xl" py="xl">
        {/* Hero Section */}
        <Stack gap="xl" align="center" py="xl">
          <Center>
            <ThemeIcon size={80} radius="xl" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
              <IconHome size="2.5rem" />
            </ThemeIcon>
          </Center>
          
          <Stack gap="md" align="center">
            <Title 
              order={1} 
              ta="center" 
              size="3rem"
              fw={700}
              c="blue"
            >
              Welcome to SwatchX
            </Title>
            
            <Text 
              ta="center" 
              size="xl" 
              c="dimmed" 
              maw={600}
              lh={1.6}
            >
              Your full-stack application is ready! Built with React, Mantine, and FastAPI 
              following modern best practices.
            </Text>
          </Stack>
        </Stack>

        {/* Features Grid */}
        <Grid gutter="lg" mb="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder shadow="sm" radius="md" h="100%" p="lg">
              <Stack gap="md" align="center">
                <ThemeIcon size={60} radius="xl" variant="light" color="blue">
                  <IconBrandReact size="2rem" />
                </ThemeIcon>
                
                <Stack gap="xs" align="center">
                  <Text fw={600} ta="center" size="lg">
                    Modern Frontend
                  </Text>
                  
                  <Text size="sm" c="dimmed" ta="center">
                    React 18 with TypeScript, Mantine UI components, and Vite for lightning-fast development
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder shadow="sm" radius="md" h="100%" p="lg">
              <Stack gap="md" align="center">
                <ThemeIcon size={60} radius="xl" variant="light" color="green">
                  <IconDatabase size="2rem" />
                </ThemeIcon>
                
                <Stack gap="xs" align="center">
                  <Text fw={600} ta="center" size="lg">
                    Robust Backend
                  </Text>
                  
                  <Text size="sm" c="dimmed" ta="center">
                    FastAPI with SQLAlchemy ORM, Pydantic validation, and SQLite database
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder shadow="sm" radius="md" h="100%" p="lg">
              <Stack gap="md" align="center">
                <ThemeIcon size={60} radius="xl" variant="light" color="orange">
                  <IconShield size="2rem" />
                </ThemeIcon>
                
                <Stack gap="xs" align="center">
                  <Text fw={600} ta="center" size="lg">
                    Secure Authentication
                  </Text>
                  
                  <Text size="sm" c="dimmed" ta="center">
                    JWT tokens, bcrypt password hashing, and comprehensive validation
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Status Section */}
        <Paper withBorder shadow="md" p="xl" radius="lg" bg="green.0">
          <Stack gap="lg" align="center">
            <ThemeIcon size={80} radius="xl" color="green" variant="light">
              <IconCheck size="2.5rem" />
            </ThemeIcon>
            
            <Title order={2} ta="center" c="green.8">
              🎉 System Status: All Ready!
            </Title>
            
            <Group justify="center" gap="md">
              <Badge variant="light" color="green" size="lg">
                ✓ Authentication Working
              </Badge>
              <Badge variant="light" color="blue" size="lg">
                ✓ Database Connected
              </Badge>
              <Badge variant="light" color="orange" size="lg">
                ✓ API Endpoints Active
              </Badge>
            </Group>

            <Group justify="center" gap="md" mt="md">
              <Button 
                size="lg" 
                leftSection={<IconRocket size="1.2rem" />}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                Start Building Features
              </Button>
              <Button 
                size="lg" 
                variant="light"
                color="blue"
              >
                View Documentation
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Layout>
  );
}
