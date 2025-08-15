import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  Box,
  Button,
  Stack,
  Divider,
  LoadingOverlay,
  Flex,
} from '@mantine/core';
import { IconArrowLeft, IconDownload } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { Layout } from '../components/Layout';
import { useCompany } from '../hooks/useCompany';
import { managementService } from '../services/api';

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
  const { selectedCompany } = useCompany();
  const [exportLoading, setExportLoading] = useState(false);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSelectManagement = (type: string) => {
    navigate(`/management/${type}`);
  };

  const handleExportData = async () => {
    if (!selectedCompany) {
      notifications.show({
        title: 'Error',
        message: 'No company selected',
        color: 'red',
      });
      return;
    }

    setExportLoading(true);
    try {
      const blob = await managementService.exportCompanyData(selectedCompany);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `${selectedCompany}_Expenses_Export_${timestamp}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notifications.show({
        title: 'Success!',
        message: 'Data exported successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Export failed:', error);
      notifications.show({
        title: 'Export Failed',
        message: 'Failed to export data. Please try again.',
        color: 'red',
      });
    } finally {
      setExportLoading(false);
    }
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

        {/* Data Export Section */}
        <Divider my="xl" />
        
        <Stack gap="lg">
          <Group gap="md">
            <Title order={2}>Data Export</Title>
          </Group>
          
          <Text size="md" c="dimmed">
            Export all expense data for {selectedCompany} company to Excel format
          </Text>
          
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="md">
              <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                <Box>
                  <Text fw={600} size="lg" mb="xs">
                    Export All Company Data
                  </Text>
                  <Text size="sm" c="dimmed">
                    Downloads a comprehensive Excel file containing all expense categories with proper formatting and summaries
                  </Text>
                </Box>
                
                <Button
                  leftSection={<IconDownload size={16} />}
                  color="green"
                  size="md"
                  onClick={handleExportData}
                  loading={exportLoading}
                >
                  Export to Excel
                </Button>
              </Flex>
              
              <Text size="xs" c="dimmed">
                • Includes all expense categories with separate sheets<br />
                • Contains summary sheet with totals by category<br />
                • Properly formatted columns with appropriate field names<br />
                • Sorted by date (most recent first)
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Container>
      
      <LoadingOverlay visible={exportLoading} overlayProps={{ blur: 2 }} />
    </Layout>
  );
}
