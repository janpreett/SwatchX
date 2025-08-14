import { useState, useEffect } from 'react';
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
import { expenseService } from '../services/api';

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
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    total: 0,
    fuel: 0,
    repairs: 0,
    thisMonth: 0,
    categoryTotals: {} as Record<string, number>
  });

  useEffect(() => {    
    const loadRecentExpenses = async () => {
      try {
        setLoading(true);
        const expenses = await expenseService.getAll();
        // Filter by company and get the 5 most recent
        const companyExpenses = expenses
          .filter((expense: any) => expense.company === selectedCompany);
        
        const recentExpenses = companyExpenses
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentExpenses(recentExpenses);

        // Calculate totals
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const total = companyExpenses.reduce((sum: number, expense: any) => sum + Number(expense.cost || 0), 0);
        const fuel = companyExpenses
          .filter((expense: any) => ['fuel-diesel', 'def'].includes(expense.category))
          .reduce((sum: number, expense: any) => sum + Number(expense.cost || 0), 0);
        const repairs = companyExpenses
          .filter((expense: any) => ['truck', 'trailer', 'parts'].includes(expense.category))
          .reduce((sum: number, expense: any) => sum + Number(expense.cost || 0), 0);
        const thisMonth = companyExpenses
          .filter((expense: any) => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, expense: any) => sum + Number(expense.cost || 0), 0);
        
        // Calculate category totals
        const categoryTotals: Record<string, number> = {};
        expenseCategories.forEach(category => {
          categoryTotals[category.key] = companyExpenses
            .filter((expense: any) => expense.category === category.key)
            .reduce((sum: number, expense: any) => sum + Number(expense.cost || 0), 0);
        });

        setTotals({
          total,
          fuel,
          repairs,
          thisMonth,
          categoryTotals
        });
      } catch (error) {
        console.error('Failed to load recent expenses:', error);
        setRecentExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCompany) {
      loadRecentExpenses();
    }
  }, [selectedCompany]);

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
                <Text size="2xl" fw={700} c="blue">${totals.thisMonth.toFixed(2)}</Text>
                <Text size="xs" c="green">This month</Text>
              </Stack>
            </Paper>
            
            <Paper p="lg" radius="md" shadow="sm">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>Fuel Costs</Text>
                <Text size="2xl" fw={700} c="teal">${totals.fuel.toFixed(2)}</Text>
                <Text size="xs" c="dimmed">Diesel & DEF</Text>
              </Stack>
            </Paper>
            
            <Paper p="lg" radius="md" shadow="sm">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>Vehicle Repairs</Text>
                <Text size="2xl" fw={700} c="orange">${totals.repairs.toFixed(2)}</Text>
                <Text size="xs" c="dimmed">Trucks & Trailers</Text>
              </Stack>
            </Paper>
            
            <Paper p="lg" radius="md" shadow="sm">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>All Time Total</Text>
                <Text size="2xl" fw={700} c="grape">${totals.total.toFixed(2)}</Text>
                <Text size="xs" c="dimmed">All categories</Text>
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
                        <Text size="xl" lh={1}>
                          {category.icon}
                        </Text>
                        <Badge color={category.color} variant="light" size="sm">
                          ${(totals.categoryTotals[category.key] || 0).toFixed(2)}
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
              {loading ? (
                <Stack align="center" gap="md" py="xl">
                  <Text size="lg" c="dimmed">Loading recent expenses...</Text>
                </Stack>
              ) : recentExpenses.length === 0 ? (
                <Stack align="center" gap="md" py="xl">
                  <Text size="lg" c="dimmed">No recent expenses</Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Start adding expenses to see recent activity here
                  </Text>
                </Stack>
              ) : (
                <Stack gap="sm">
                  {recentExpenses.map((expense: any, index: number) => (
                    <Group key={expense.id || index} justify="space-between" p="md" bg="gray.0" style={{ borderRadius: 8 }}>
                      <Box>
                        <Text fw={600}>{expense.category?.charAt(0).toUpperCase() + expense.category?.slice(1) || 'Expense'}</Text>
                        <Text size="sm" c="dimmed">
                          {new Date(expense.date).toLocaleDateString()} • {expense.description || expense.repair_description || 'No description'}
                        </Text>
                      </Box>
                      <Badge color="green" variant="light">
                        ${Number(expense.cost || 0).toFixed(2)}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              )}
            </Card>
          </Box>
        </Stack>
      </Container>
    </Layout>
  );
}
