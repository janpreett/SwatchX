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
  ActionIcon,
  Flex
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconTable, IconSettings, IconArrowLeft } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useCompany } from '../hooks/useCompany';
import { expenseService } from '../services/api';
import { EXPENSE_CATEGORIES } from '../constants/expenseCategories';

interface DashboardExpense {
  id: number;
  date: string;
  category: string;
  company: string;
  cost: number;
  description?: string;
  repair_description?: string;
  repairDescription?: string;
  gallons?: number;
  businessUnit?: { name: string };
  truck?: { number: string };
  trailer?: { number: string };
  fuelStation?: { name: string };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { selectedCompany, clearSelectedCompany } = useCompany();
  const [recentExpenses, setRecentExpenses] = useState<DashboardExpense[]>([]);
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
          .filter((expense: DashboardExpense) => expense.company === selectedCompany);
        
        const recentExpenses = companyExpenses
          .sort((a: DashboardExpense, b: DashboardExpense) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentExpenses(recentExpenses);

        // Calculate totals
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const total = companyExpenses.reduce((sum: number, expense: DashboardExpense) => sum + Number(expense.cost || 0), 0);
        const fuel = companyExpenses
          .filter((expense: DashboardExpense) => ['fuel-diesel', 'def'].includes(expense.category))
          .reduce((sum: number, expense: DashboardExpense) => sum + Number(expense.cost || 0), 0);
        const repairs = companyExpenses
          .filter((expense: DashboardExpense) => ['truck', 'trailer', 'parts'].includes(expense.category))
          .reduce((sum: number, expense: DashboardExpense) => sum + Number(expense.cost || 0), 0);
        const thisMonth = companyExpenses
          .filter((expense: DashboardExpense) => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, expense: DashboardExpense) => sum + Number(expense.cost || 0), 0);
        
        // Calculate category totals
        const categoryTotals: Record<string, number> = {};
        EXPENSE_CATEGORIES.forEach(category => {
          categoryTotals[category.key] = companyExpenses
            .filter((expense: DashboardExpense) => expense.category === category.key)
            .reduce((sum: number, expense: DashboardExpense) => sum + Number(expense.cost || 0), 0);
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
            <Card 
              shadow="sm" 
              padding="xl" 
              radius="md" 
              bg="gray.0"
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
              }}
            >
              <Stack gap="sm">
                <Text size="md" c="dimmed" fw={500}>Total Expenses</Text>
                <Text size="3xl" fw={700} c="blue">${totals.thisMonth.toFixed(2)}</Text>
                <Text size="sm" c="green" fw={500}>This month</Text>
              </Stack>
            </Card>
            
            <Card 
              shadow="sm" 
              padding="xl" 
              radius="md" 
              bg="gray.0"
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
              }}
            >
              <Stack gap="sm">
                <Text size="md" c="dimmed" fw={500}>Fuel Costs</Text>
                <Text size="3xl" fw={700} c="teal">${totals.fuel.toFixed(2)}</Text>
                <Text size="sm" c="dimmed" fw={500}>Diesel & DEF</Text>
              </Stack>
            </Card>
            
            <Card 
              shadow="sm" 
              padding="xl" 
              radius="md" 
              bg="gray.0"
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
              }}
            >
              <Stack gap="sm">
                <Text size="md" c="dimmed" fw={500}>Vehicle Repairs</Text>
                <Text size="3xl" fw={700} c="orange">${totals.repairs.toFixed(2)}</Text>
                <Text size="sm" c="dimmed" fw={500}>Trucks & Trailers</Text>
              </Stack>
            </Card>
            
            <Card 
              shadow="sm" 
              padding="xl" 
              radius="md" 
              bg="gray.0"
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
              }}
            >
              <Stack gap="sm">
                <Text size="md" c="dimmed" fw={500}>All Time Total</Text>
                <Text size="3xl" fw={700} c="grape">${totals.total.toFixed(2)}</Text>
                <Text size="sm" c="dimmed" fw={500}>All categories</Text>
              </Stack>
            </Card>
          </SimpleGrid>

          {/* Expense Categories */}
          <Box>
            <Group justify="space-between" align="center" mb="xl">
              <Text size="5xl" fw={700} c="dark" gradient={{ from: 'blue', to: 'cyan', deg: 45 }} variant="gradient">
                Expense Categories
              </Text>
              <Badge variant="light" color="blue" size="lg">
                {EXPENSE_CATEGORIES.length} Categories
              </Badge>
            </Group>
            <Grid gutter="lg">
              {EXPENSE_CATEGORIES.map((category) => (
                <Grid.Col key={category.key} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card 
                    shadow="sm" 
                    padding="xl" 
                    radius="md" 
                    h="100%"
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
                    }}
                  >
                    <Stack gap="md">
                      <Group justify="space-between" align="flex-start">
                        <Text fw={700} size="md" c="dark">
                          {category.label}
                        </Text>
                        <Badge color={category.color} variant="light" size="lg">
                          <Text size="lg" fw={700}>
                            ${(totals.categoryTotals[category.key] || 0).toFixed(2)}
                          </Text>
                        </Badge>
                      </Group>
                      
                      <Group gap="xs" grow mt="xl">
                        <Button
                          variant="light"
                          color={category.color}
                          size="sm"
                          leftSection={<IconPlus size={14} />}
                          onClick={() => handleAddExpense(category.key)}
                        >
                          Add
                        </Button>
                        <Button
                          variant="outline"
                          color={category.color}
                          size="sm"
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
            <Group justify="space-between" align="center" mb="xl">
              <Text size="5xl" fw={700} c="dark" gradient={{ from: 'green', to: 'teal', deg: 45 }} variant="gradient">
                Recent Activity
              </Text>
              <Badge variant="light" color="green" size="lg">
                Last 5 Expenses
              </Badge>
            </Group>
            <Card shadow="sm" padding="2xl" radius="md">
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
                <Stack gap="md">
                  {recentExpenses.map((expense: DashboardExpense, index: number) => (
                    <Card 
                      key={expense.id || index} 
                      withBorder 
                      shadow="xs" 
                      padding="lg" 
                      radius="md"
                      bg="gray.0"
                    >
                      <Group justify="space-between" align="flex-start" mb="sm">
                        <Box flex={1}>
                          <Group justify="space-between" align="flex-start" mb="xs">
                            <Text fw={700} size="lg" c="dark">
                              {expense.category?.charAt(0).toUpperCase() + expense.category?.slice(1) || 'Expense'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {new Date(expense.date).toLocaleDateString()}
                            </Text>
                          </Group>
                          <Stack gap="xs">
                            {expense.businessUnit && (
                              <Text size="sm">
                                <Text fw={600} span c="dark.8">Business Unit:</Text> 
                                <Text span ml="xs" c="dark.6">{expense.businessUnit.name}</Text>
                              </Text>
                            )}
                            {expense.truck && (
                              <Text size="sm">
                                <Text fw={600} span c="dark.8">Truck:</Text> 
                                <Text span ml="xs" c="dark.6">{expense.truck.number}</Text>
                              </Text>
                            )}
                            {expense.trailer && (
                              <Text size="sm">
                                <Text fw={600} span c="dark.8">Trailer:</Text> 
                                <Text span ml="xs" c="dark.6">{expense.trailer.number}</Text>
                              </Text>
                            )}
                            {expense.fuelStation && (
                              <Text size="sm">
                                <Text fw={600} span c="dark.8">Fuel Station:</Text> 
                                <Text span ml="xs" c="dark.6">{expense.fuelStation.name}</Text>
                              </Text>
                            )}
                            {expense.gallons && (
                              <Text size="sm">
                                <Text fw={600} span c="dark.8">Gallons:</Text> 
                                <Text span ml="xs" c="dark.6">{expense.gallons}</Text>
                              </Text>
                            )}
                            {expense.description && (
                              <Text size="sm">
                                <Text fw={600} span c="dark.8">Description:</Text> 
                                <Text span ml="xs" c="dark.6">{expense.description}</Text>
                              </Text>
                            )}
                            {(expense.repairDescription || expense.repair_description) && (
                              <Text size="sm">
                                <Text fw={600} span c="dark.8">Repair Description:</Text> 
                                <Text span ml="xs" c="dark.6">{expense.repairDescription || expense.repair_description}</Text>
                              </Text>
                            )}
                          </Stack>
                        </Box>
                        <Badge color="green" variant="filled" size="lg" radius="md">
                          <Text fw={700} size="sm">
                            ${Number(expense.cost || 0).toFixed(2)}
                          </Text>
                        </Badge>
                      </Group>
                    </Card>
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
