import { Container, Title, Text, Button, Paper, Group, Stack, Grid, Card, Badge, ThemeIcon, Flex } from '@mantine/core';
import { IconHome, IconBrandReact, IconDatabase, IconShield, IconCheck, IconRocket } from '@tabler/icons-react';
import { Layout } from '../components/Layout';

export function HomePage() {
  return (
    <Layout>
      <Container size="xl" py="xl">
        {/* Hero Section */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          mih="40vh"
          mb="xl"
        >
          <ThemeIcon size={80} radius="xl" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} mb="md">
            <IconHome size="2.5rem" />
          </ThemeIcon>
          
          <Title 
            order={1} 
            ta="center" 
            size="3rem"
            fw={700}
            mb="md"
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
        </Flex>

        {/* Features Grid */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder shadow="sm" radius="md" h="100%">
              <Group justify="center" mb="md">
                <ThemeIcon size={50} radius="xl" variant="light" color="blue">
                  <IconBrandReact size="1.5rem" />
                </ThemeIcon>
              </Group>
              
              <Text fw={600} ta="center" mb="xs">
                Modern Frontend
              </Text>
              
              <Text size="sm" c="dimmed" ta="center">
                React 18 with TypeScript, Mantine UI components, and Vite for lightning-fast development
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder shadow="sm" radius="md" h="100%">
              <Group justify="center" mb="md">
                <ThemeIcon size={50} radius="xl" variant="light" color="green">
                  <IconDatabase size="1.5rem" />
                </ThemeIcon>
              </Group>
              
              <Text fw={600} ta="center" mb="xs">
                Robust Backend
              </Text>
              
              <Text size="sm" c="dimmed" ta="center">
                FastAPI with SQLAlchemy ORM, Pydantic validation, and SQLite database
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder shadow="sm" radius="md" h="100%">
              <Group justify="center" mb="md">
                <ThemeIcon size={50} radius="xl" variant="light" color="orange">
                  <IconShield size="1.5rem" />
                </ThemeIcon>
              </Group>
              
              <Text fw={600} ta="center" mb="xs">
                Secure Authentication
              </Text>
              
              <Text size="sm" c="dimmed" ta="center">
                JWT tokens, bcrypt password hashing, and comprehensive validation
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Status Section */}
        <Paper withBorder shadow="md" p="xl" radius="lg" bg="green.0">
          <Group justify="center" mb="md">
            <ThemeIcon size={60} radius="xl" color="green" variant="light">
              <IconCheck size="2rem" />
            </ThemeIcon>
          </Group>
          
          <Title order={2} ta="center" c="green.8" mb="md">
            🎉 System Status: All Ready!
          </Title>
          
          <Stack gap="sm">
            <Group justify="center">
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
          </Stack>

          <Group justify="center" mt="xl">
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
            >
              View Documentation
            </Button>
          </Group>
        </Paper>
      </Container>
    </Layout>
  );
}
