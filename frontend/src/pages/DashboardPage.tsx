import { 
  Container, 
  Text, 
  Stack, 
  Card, 
  Group, 
  Box, 
  Button, 
  Grid, 
  Badge,
  SimpleGrid,
  Paper,
  ActionIcon,
  Flex
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconTable, IconSettings, IconArrowLeft } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useCompany } from '../hooks/useCompany';

const expenseCategories = [
  { key: 'truck', label: 'Truck', color: 'blue', icon: '🚛' },
  { key: 'trailer', label: 'Trailer', color: 'green', icon: '🚚' },
  { key: 'dmv', label: 'DMV', color: 'orange', icon: '📋' },
  { key: 'parts', label: 'Parts', color: 'red', icon: '🔧' },
  { key: 'phone-tracker', label: 'Phone Tracker', color: 'purple', icon: '📱' },
  { key: 'other-expenses', label: 'Other Expenses', color: 'gray', icon: '💼' },
  { key: 'toll', label: 'Toll', color: 'yellow', icon: '🛣️' },
  { key: 'office-supplies', label: 'Office Supplies', color: 'pink', icon: '📝' },
  { key: 'fuel-diesel', label: 'Fuel (Diesel)', color: 'teal', icon: '⛽' },
  { key: 'def', label: 'DEF', color: 'indigo', icon: '🧪' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { selectedCompany, clearSelectedCompany } = useCompany();

  if (!selectedCompany) {
    // Redirect back to home if no company is selected
    navigate('/home');
    return null;
  }

  const handleBackToHome = () => {
    clearSelectedCompany();
    navigate('/home');
  };

  const handleAddExpense = (category: string) => {
    navigate(`/forms/${category}`);
  };

  const handleViewTable = (category: string) => {
    navigate(`/tables/${category}`);
  };

  const handleManagement = () => {
    navigate('/management');
  };

  return (
    <Layout>
      <Container size="xl" py="xl">
        <Stack gap="2rem">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="md">
              <ActionIcon 
                variant="light" 
                size="lg"
                onClick={handleBackToHome}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <Box>
                <Text size="2.5rem" fw={700} c={selectedCompany === 'Swatch' ? 'blue' : 'cyan'}>
                  {selectedCompany} Dashboard
                </Text>
                <Badge 
                  color={selectedCompany === 'Swatch' ? 'blue' : 'cyan'} 
                  variant="light" 
                  size="lg"
                >
                  Active Company
                </Badge>
              </Box>
            </Group>
            
            <Button
              leftSection={<IconSettings size={16} />}
              variant="light"
              onClick={handleManagement}
            >
              Management
            </Button>
          </Flex>

          {/* Summary Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <Paper p="lg" radius="md" shadow="sm">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>Total Expenses</Text>
                <Text size="2xl" fw={700} c="blue">$0.00</Text>
                <Text size="xs" c="green">This month</Text>
              </Stack>
            </Paper>
            
            <Paper p="lg" radius="md" shadow="sm">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>Fuel Costs</Text>
                <Text size="2xl" fw={700} c="teal">$0.00</Text>
                <Text size="xs" c="dimmed">Diesel & DEF</Text>
              </Stack>
            </Paper>
            
            <Paper p="lg" radius="md" shadow="sm">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>Vehicle Repairs</Text>
                <Text size="2xl" fw={700} c="orange">$0.00</Text>
                <Text size="xs" c="dimmed">Trucks & Trailers</Text>
              </Stack>
            </Paper>
            
            <Paper p="lg" radius="md" shadow="sm">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>Recent Entries</Text>
                <Text size="2xl" fw={700} c="grape">0</Text>
                <Text size="xs" c="dimmed">Last 7 days</Text>
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* Expense Categories */}
          <Box>
            <Text size="xl" fw={600} mb="lg">Expense Categories</Text>
            <Grid gutter="lg">
              {expenseCategories.map((category) => (
                <Grid.Col key={category.key} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card shadow="sm" padding="lg" radius="md" h="100%">
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Box>
                          <Text size="2rem">{category.icon}</Text>
                        </Box>
                        <Badge color={category.color} variant="light" size="sm">
                          $0.00
                        </Badge>
                      </Group>
                      
                      <Text fw={600} size="md">
                        {category.label}
                      </Text>
                      
                      <Group gap="xs" grow>
                        <Button
                          variant="light"
                          color={category.color}
                          size="xs"
                          leftSection={<IconPlus size={14} />}
                          onClick={() => handleAddExpense(category.key)}
                        >
                          Add
                        </Button>
                        <Button
                          variant="outline"
                          color={category.color}
                          size="xs"
                          leftSection={<IconTable size={14} />}
                          onClick={() => handleViewTable(category.key)}
                        >
                          View
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Box>

          {/* Recent Activity */}
          <Box>
            <Text size="xl" fw={600} mb="lg">Recent Activity</Text>
            <Card shadow="sm" padding="xl" radius="md">
              <Stack align="center" gap="md" py="xl">
                <Text size="lg" c="dimmed">No recent expenses</Text>
                <Text size="sm" c="dimmed" ta="center">
                  Start adding expenses to see recent activity here
                </Text>
                <Button 
                  variant="light" 
                  color={selectedCompany === 'Swatch' ? 'blue' : 'cyan'}
                  leftSection={<IconPlus size={16} />}
                >
                  Add First Expense
                </Button>
              </Stack>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Layout>
  );
}
