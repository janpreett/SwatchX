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

        <Grid>
          {managementOptions.map((option) => (
            <Grid.Col key={option.type} span={{ base: 12, sm: 6, md: 3 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: 'pointer', height: '100%' }}
                onClick={() => handleSelectManagement(option.type)}
              >
                <Group gap="md" mb="md">
                  <Text size="2rem">{option.icon}</Text>
                  <Title order={3} size="h4">{option.title}</Title>
                </Group>
                
                <Text size="sm" c="dimmed">
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
