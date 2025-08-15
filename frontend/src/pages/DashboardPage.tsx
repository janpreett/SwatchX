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
  Flex,
  Loader,
  Center,
  Modal
} from '@mantine/core';
import { PieChart } from '@mantine/charts';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconTable, IconSettings, IconArrowLeft, IconTrendingUp, IconTrendingDown, IconChartPie } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useCompany } from '../hooks/useCompany';
import { expenseService, managementService } from '../services/api';
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

interface MonthlyChangeData {
  current_month: number;
  previous_month: number;
  percentage_change: number;
}

interface PieChartDataItem {
  category: string;
  name: string;
  value: number;
  color: string;
}

interface PieChartData {
  company: string;
  period: string;
  data: PieChartDataItem[];
  total_amount: number;
  category_count: number;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { selectedCompany, clearSelectedCompany } = useCompany();
  const [recentExpenses, setRecentExpenses] = useState<DashboardExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [totals, setTotals] = useState({
    total: 0,
    thisMonth: 0,
    categoryTotals: {} as Record<string, number>
  });
  const [monthlyChange, setMonthlyChange] = useState<MonthlyChangeData | null>(null);
  const [pieChartData, setPieChartData] = useState<PieChartData | null>(null);
  const [pieChartPeriod, setPieChartPeriod] = useState<'this-month' | 'total'>('total');
  const [pieModalOpened, { open: openPieModal, close: closePieModal }] = useDisclosure(false);

  useEffect(() => {    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setAnalyticsLoading(true);
        
        // Load expenses
        const expenses = await expenseService.getAll();
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
          thisMonth,
          categoryTotals
        });
        
        // Load analytics data
        try {
          if (selectedCompany) {
            const [monthlyChangeData, pieChartData] = await Promise.all([
              managementService.getMonthlyChange(selectedCompany),
              managementService.getPieChartData(selectedCompany, pieChartPeriod)
            ]);
            
            console.log('Pie chart data received:', pieChartData);
            setMonthlyChange(monthlyChangeData);
            setPieChartData(pieChartData);
          }
        } catch (analyticsError) {
          console.error('Analytics failed:', analyticsError);
          setMonthlyChange(null);
          setPieChartData(null);
        }
        setAnalyticsLoading(false);
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setRecentExpenses([]);
        setMonthlyChange(null);
        setPieChartData(null);
      } finally {
        setLoading(false);
        setAnalyticsLoading(false);
      }
    };

    if (selectedCompany) {
      loadDashboardData();
    }
  }, [selectedCompany, pieChartPeriod]);

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

  const loadPieChartData = async (period: 'this-month' | 'total') => {
    if (!selectedCompany) return;
    
    try {
      setAnalyticsLoading(true);
      const data = await managementService.getPieChartData(selectedCompany, period);
      console.log('Loading pie chart data:', data);
      setPieChartData(data);
      setPieChartPeriod(period);
    } catch (error) {
      console.error('Failed to load pie chart data:', error);
      setPieChartData(null);
    } finally {
      setAnalyticsLoading(false);
    }
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
                <Text size="md" c="dimmed" fw={500}>This Month</Text>
                <Text size="3xl" fw={700} c="blue">${totals.thisMonth.toFixed(2)}</Text>
                <Text size="sm" c="green" fw={500}>Current month expenses</Text>
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
                <Text size="md" c="dimmed" fw={500}>Month-over-Month Change</Text>
                {analyticsLoading ? (
                  <Center>
                    <Loader size="sm" />
                  </Center>
                ) : monthlyChange ? (
                  <>
                    <Group gap="xs" align="center">
                      {monthlyChange.percentage_change >= 0 ? (
                        <IconTrendingUp size={24} color="red" />
                      ) : (
                        <IconTrendingDown size={24} color="green" />
                      )}
                      <Text 
                        size="3xl" 
                        fw={700} 
                        c={monthlyChange.percentage_change >= 0 ? 'red' : 'green'}
                      >
                        {Math.abs(monthlyChange.percentage_change).toFixed(1)}%
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed" fw={500}>
                      vs last month
                    </Text>
                  </>
                ) : (
                  <Text size="lg" c="dimmed">No data</Text>
                )}
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
              onClick={() => {
                console.log('Opening pie modal, current data:', pieChartData);
                openPieModal();
              }}
            >
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text size="md" c="dimmed" fw={500}>Category Breakdown</Text>
                  <ActionIcon variant="light" color="blue" size="sm">
                    <IconChartPie size={16} />
                  </ActionIcon>
                </Group>
                {analyticsLoading ? (
                  <Center py="md">
                    <Loader size="sm" />
                  </Center>
                ) : pieChartData?.data && pieChartData.data.length > 0 ? (
                  <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PieChart
                      h={80}
                      data={pieChartData.data}
                      withTooltip={false}
                      size={70}
                      strokeWidth={1}
                    />
                  </Box>
                ) : (
                  <Text size="sm" c="dimmed">No category data</Text>
                )}
                <Text size="sm" c="dimmed" fw={500}>Click to expand</Text>
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

          {/* Modal for Pie Chart */}
          <Modal
            opened={pieModalOpened}
            onClose={closePieModal}
            title={
              <Group gap="sm">
                <IconChartPie size={24} color="var(--mantine-color-blue-6)" />
                <Text size="xl" fw={700}>Expense Categories Breakdown</Text>
              </Group>
            }
            size="xl"
            centered
          >
            <Stack gap="lg">
              {/* Period Toggle Buttons */}
              <Group justify="center" gap="md">
                <Button
                  variant={pieChartPeriod === 'this-month' ? 'filled' : 'light'}
                  color="blue"
                  onClick={() => loadPieChartData('this-month')}
                  loading={analyticsLoading}
                >
                  This Month
                </Button>
                <Button
                  variant={pieChartPeriod === 'total' ? 'filled' : 'light'}
                  color="blue"
                  onClick={() => loadPieChartData('total')}
                  loading={analyticsLoading}
                >
                  Total
                </Button>
              </Group>

              {/* Large Pie Chart */}
              {analyticsLoading ? (
                <Center py="xl">
                  <Loader size="lg" />
                </Center>
              ) : pieChartData?.data && pieChartData.data.length > 0 ? (
                <Box>
                  <Center>
                    <PieChart
                      h={400}
                      data={pieChartData.data}
                      withTooltip={true}
                      size={300}
                      withLabels
                      labelsType="value"
                      labelsPosition="outside"
                    />
                  </Center>
                  <Card mt="lg" shadow="xs" padding="lg">
                    <Group justify="space-between" mb="md">
                      <Text fw={600}>Summary</Text>
                      <Badge color="blue" variant="light">
                        {pieChartData.category_count} Categories
                      </Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Total Amount:</Text>
                      <Text fw={600} size="lg" c="blue">
                        ${pieChartData.total_amount.toFixed(2)}
                      </Text>
                    </Group>
                  </Card>
                </Box>
              ) : (
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <Text size="lg" c="dimmed">No category data available</Text>
                    <Text size="sm" c="dimmed" ta="center">
                      Try switching between "This Month" and "Total" or add some expenses first.
                    </Text>
                  </Stack>
                </Center>
              )}
            </Stack>
          </Modal>

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
