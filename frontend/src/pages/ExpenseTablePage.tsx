import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Stack,
  Group,
  Button,
  Card,
  Table,
  ActionIcon,
  Text,
  TextInput,
  Flex,
  Box,
  Badge,
  Alert,
  Loader,
  Center,
  Checkbox
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending
} from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useCompany } from '../hooks/useCompany';
import { expenseService } from '../services/api';

interface Expense {
  id: number;
  date: string;
  category: string;
  company: string;
  cost: number;
  description?: string;
  repairDescription?: string;
  gallons?: number;
  businessUnit?: { name: string };
  truck?: { number: string };
  trailer?: { number: string };
  fuelStation?: { name: string };
}

const categoryLabels = {
  truck: 'Truck Repair',
  trailer: 'Trailer Repair',
  dmv: 'DMV',
  parts: 'Parts',
  'phone-tracker': 'Phone Tracker',
  'other-expenses': 'Other Expenses',
  toll: 'Toll',
  'office-supplies': 'Office Supplies',
  'fuel-diesel': 'Fuel (Diesel)',
  def: 'DEF',
} as const;

const categoryIcons = {
  truck: '🚛',
  trailer: '🚚',
  dmv: '📋',
  parts: '🔧',
  'phone-tracker': '📱',
  'other-expenses': '💼',
  toll: '🛣️',
  'office-supplies': '📝',
  'fuel-diesel': '⛽',
  def: '🧪',
} as const;

export function ExpenseTablePage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Expense>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dateFilter, setDateFilter] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null
  });

  useEffect(() => {
    if (!selectedCompany) {
      navigate('/home');
      return;
    }

    const loadExpenses = async () => {
      setLoading(true);
      try {
        const data = await expenseService.getAll();
        // Filter by category and company
        const filteredData = data.filter(expense => 
          expense.category === category && expense.company === selectedCompany
        );
        setExpenses(filteredData);
      } catch (error) {
        console.error('Failed to load expenses:', error);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [selectedCompany, category, navigate]);

  if (!selectedCompany) {
    return null;
  }

  if (!category || !(category in categoryLabels)) {
    navigate('/dashboard');
    return null;
  }

  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels];
  const categoryIcon = categoryIcons[category as keyof typeof categoryIcons];

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleAddExpense = () => {
    navigate(`/forms/${category}`);
  };

  const handleEditExpense = (id: number) => {
    navigate(`/forms/${category}?edit=${id}`);
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.delete(id);
        // Reload expenses
        const data = await expenseService.getAll();
        const filteredData = data.filter((expense: any) => 
          expense.category === category && expense.company === selectedCompany
        );
        setExpenses(filteredData);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} expense(s)?`)) {
      try {
        await Promise.all(selectedIds.map(id => expenseService.delete(id)));
        // Reload expenses
        const data = await expenseService.getAll();
        const filteredData = data.filter((expense: any) => 
          expense.category === category && expense.company === selectedCompany
        );
        setExpenses(filteredData);
        setSelectedIds([]);
      } catch (error) {
        console.error('Failed to delete expenses:', error);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredExpenses.map(expense => expense.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectExpense = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(expenseId => expenseId !== id));
    }
  };

  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = !searchTerm || 
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.repairDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.businessUnit?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.truck?.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.trailer?.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.fuelStation?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDateFilter = (!dateFilter.from || new Date(expense.date) >= dateFilter.from) &&
        (!dateFilter.to || new Date(expense.date) <= dateFilter.to);

      return matchesSearch && matchesDateFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const totalCost = filteredExpenses.reduce((sum, expense) => sum + expense.cost, 0);

  const SortButton = ({ field, children }: { field: keyof Expense; children: React.ReactNode }) => (
    <Button 
      variant="subtle" 
      size="compact-xs"
      onClick={() => handleSort(field)}
      rightSection={
        sortField === field ? (
          sortOrder === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />
        ) : null
      }
    >
      {children}
    </Button>
  );

  return (
    <Layout>
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="md">
              <ActionIcon variant="light" size="lg" onClick={handleBack}>
                <IconArrowLeft size={18} />
              </ActionIcon>
              <Box>
                <Group gap="sm">
                  <Text size="2rem">{categoryIcon}</Text>
                  <Title order={1}>{categoryLabel} Expenses</Title>
                </Group>
                <Text c="dimmed">
                  {selectedCompany} • View and manage expenses
                </Text>
              </Box>
            </Group>
            
            <Group gap="sm">
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleAddExpense}
              >
                Add Expense
              </Button>
              
              {selectedIds.length > 0 && (
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleBulkDelete}
                >
                  Delete ({selectedIds.length})
                </Button>
              )}
            </Group>
          </Flex>

          {/* Filters */}
          <Card shadow="sm" padding="md" radius="md">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group gap="sm">
                  <IconFilter size={16} />
                  <Text fw={500}>Filters</Text>
                </Group>
                {(searchTerm || dateFilter.from || dateFilter.to) && (
                  <Button 
                    variant="light" 
                    size="compact-sm"
                    onClick={() => {
                      setSearchTerm('');
                      setDateFilter({ from: null, to: null });
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Group>

              <Group grow>
                <TextInput
                  placeholder="Search expenses..."
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <DateInput
                  placeholder="From date"
                  value={dateFilter.from}
                  onChange={(date) => setDateFilter(prev => ({ ...prev, from: date as Date | null }))}
                  clearable
                />
                <DateInput
                  placeholder="To date"
                  value={dateFilter.to}
                  onChange={(date) => setDateFilter(prev => ({ ...prev, to: date as Date | null }))}
                  clearable
                />
              </Group>
            </Stack>
          </Card>

          {/* Summary */}
          <Card shadow="sm" padding="md" radius="md">
            <Group justify="space-between">
              <Text fw={500}>
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
              </Text>
              <Badge size="lg" variant="light" color="green">
                Total: ${totalCost.toFixed(2)}
              </Badge>
            </Group>
          </Card>

          {error && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}

          {/* Table */}
          <Card shadow="sm" radius="md">
            {loading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : filteredExpenses.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="md">
                  <Text size="lg" c="dimmed">No expenses found</Text>
                  <Text size="sm" c="dimmed" ta="center">
                    {expenses.length === 0 
                      ? `No ${categoryLabel.toLowerCase()} expenses for ${selectedCompany} yet.`
                      : 'Try adjusting your filters to see more results.'
                    }
                  </Text>
                  <Button 
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddExpense}
                  >
                    Add First Expense
                  </Button>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={50}>
                        <Checkbox
                          checked={selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                          indeterminate={selectedIds.length > 0 && selectedIds.length < filteredExpenses.length}
                          onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                        />
                      </Table.Th>
                      <Table.Th><SortButton field="date">Date</SortButton></Table.Th>
                      <Table.Th>Details</Table.Th>
                      <Table.Th><SortButton field="cost">Cost</SortButton></Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredExpenses.map((expense) => (
                      <Table.Tr key={expense.id}>
                        <Table.Td>
                          <Checkbox
                            checked={selectedIds.includes(expense.id)}
                            onChange={(event) => handleSelectExpense(expense.id, event.currentTarget.checked)}
                          />
                        </Table.Td>
                        <Table.Td>
                          {new Date(expense.date).toLocaleDateString()}
                        </Table.Td>
                        <Table.Td>
                          <Stack gap="xs">
                            {expense.businessUnit && (
                              <Text size="sm">Unit: {expense.businessUnit.name}</Text>
                            )}
                            {expense.truck && (
                              <Text size="sm">Truck: {expense.truck.number}</Text>
                            )}
                            {expense.trailer && (
                              <Text size="sm">Trailer: {expense.trailer.number}</Text>
                            )}
                            {expense.fuelStation && (
                              <Text size="sm">Station: {expense.fuelStation.name}</Text>
                            )}
                            {expense.gallons && (
                              <Text size="sm">Gallons: {expense.gallons}</Text>
                            )}
                            {expense.description && (
                              <Text size="sm" c="dimmed">{expense.description}</Text>
                            )}
                            {expense.repairDescription && (
                              <Text size="sm" c="dimmed">{expense.repairDescription}</Text>
                            )}
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>${expense.cost.toFixed(2)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon 
                              variant="light" 
                              color="blue"
                              onClick={() => handleEditExpense(expense.id)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon 
                              variant="light" 
                              color="red"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
