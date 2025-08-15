import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  Box,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Layout } from '../components/Layout';

const managementOptions = [
  {
    type: 'business-units',
    title: 'Business Units',
    description: 'Manage organizational divisions',
    icon: '🏢',
    color: 'blue'
  },
  {
    type: 'trucks',
    title: 'Trucks',
    description: 'Manage fleet vehicles',
    icon: '🚛',
    color: 'green'
  },
  {
    type: 'trailers',
    title: 'Trailers',
    description: 'Manage trailer units',
    icon: '🚚',
    color: 'orange'
  },
  {
    type: 'fuel-stations',
    title: 'Fuel Stations',
    description: 'Manage refueling locations',
    icon: '⛽',
    color: 'teal'
  }
];

export function ManagementIndexPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSelectManagement = (type: string) => {
    navigate(`/management/${type}`);
  };

  return (
    <Layout>
      <Container size="lg" py="xl">
        <Group mb="xl">
          <Box onClick={handleBack} style={{ cursor: 'pointer' }}>
            <IconArrowLeft size={24} />
          </Box>
          <Title order={1}>Management</Title>
        </Group>

        <Text size="lg" c="dimmed" mb="xl">
          Select a category to manage your fleet data
        </Text>

        <Grid gutter="xl">
          {managementOptions.map((option) => (
            <Grid.Col key={option.type} span={{ base: 12, sm: 6, md: 3 }}>
              <Card
                shadow="sm"
                padding="xl"
                radius="md"
                h="100%"
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleSelectManagement(option.type)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
                }}
              >
                <Group gap="md" mb="lg" align="flex-start">
                  <Text fw={700} size="xl" c={option.color}>
                    {option.title}
                  </Text>
                </Group>
                
                <Text size="md" c="dimmed" fw={500}>
                  {option.description}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
}
