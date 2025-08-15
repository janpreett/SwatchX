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
  Checkbox,
  Modal
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconCheck,
  IconDownload,
  IconX
} from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useCompany } from '../hooks/useCompany';
import { useThemeColors } from '../hooks/useThemeColors';
import { expenseService } from '../services/api';
import { CATEGORY_CONFIG_MAP } from '../constants/expenseCategories';

interface Expense {
  id: number;
  date: string;
  category: string;
  company: string;
  price: number;
  description?: string;
  repair_description?: string; // Backend uses snake_case
  repairDescription?: string; // Keep for compatibility
  gallons?: number;
  businessUnit?: { name: string };
  truck?: { number: string };
  trailer?: { number: string };
  fuelStation?: { name: string };
  attachment_path?: string; // Backend uses snake_case
  attachmentPath?: string; // Keep for consistency
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


export function ExpenseTablePage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const themeColors = useThemeColors();
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
  const [attachmentToRemove, setAttachmentToRemove] = useState<{ id: number; filename: string } | null>(null);

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
        const filteredData = data.filter((expense: Expense) => 
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

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleAddExpense = () => {
    navigate(`/forms/${category}`);
  };

  const handleEditExpense = (id: number) => {
    // Open edit form, it will return to this table page when done
    navigate(`/forms/${category}?edit=${id}&returnTo=${encodeURIComponent(window.location.pathname)}`);
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.delete(id);
        // Reload expenses
        const data = await expenseService.getAll();
        const filteredData = data.filter((expense: Expense) => 
          expense.category === category && expense.company === selectedCompany
        );
        setExpenses(filteredData);
        notifications.show({
          title: 'Success!',
          message: 'Expense deleted successfully',
          color: 'green',
          icon: <IconCheck size="1rem" />,
        });
      } catch (error) {
        console.error('Failed to delete expense:', error);
        notifications.show({
          title: 'Error!',
          message: 'Failed to delete expense',
          color: 'red',
          icon: <IconTrash size="1rem" />,
        });
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
        const filteredData = data.filter((expense: Expense) => 
          expense.category === category && expense.company === selectedCompany
        );
        setExpenses(filteredData);
        setSelectedIds([]);
        notifications.show({
          title: 'Success!',
          message: `${selectedIds.length} expense(s) deleted successfully`,
          color: 'green',
          icon: <IconCheck size="1rem" />,
        });
      } catch (error) {
        console.error('Failed to delete expenses:', error);
        notifications.show({
          title: 'Error!',
          message: 'Failed to delete expenses',
          color: 'red',
          icon: <IconTrash size="1rem" />,
        });
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

  const handleDownloadAttachment = async (expenseId: number, attachmentPath: string) => {
    try {
      const blob = await expenseService.downloadAttachment(expenseId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from path
      const filename = attachmentPath.split('/').pop() || 'attachment';
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      notifications.show({
        title: 'Download Failed',
        message: 'Failed to download attachment. Please try again.',
        color: 'red',
      });
    }
  };

  const handleRemoveAttachment = async (expenseId: number) => {
    try {
      await expenseService.removeAttachment(expenseId);
      
      // Update the expense in the local state
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, attachment_path: undefined }
          : expense
      ));
      
      notifications.show({
        title: 'Success',
        message: 'Attachment removed successfully',
        color: 'green',
      });
      
      setAttachmentToRemove(null);
    } catch (error) {
      console.error('Failed to remove attachment:', error);
      notifications.show({
        title: 'Remove Failed',
        message: 'Failed to remove attachment. Please try again.',
        color: 'red',
      });
    }
  };

  const handleRemoveAttachmentClick = (expenseId: number, attachmentPath: string) => {
    const filename = attachmentPath.split('/').pop() || 'attachment';
    setAttachmentToRemove({ id: expenseId, filename });
  };

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        // Basic expense fields
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.repair_description?.toLowerCase().includes(searchLower) ||
        expense.repairDescription?.toLowerCase().includes(searchLower) ||
        expense.price?.toString().includes(searchLower) ||
        expense.gallons?.toString().includes(searchLower) ||
        // Date field (format: YYYY-MM-DD and readable format)
        expense.date?.toLowerCase().includes(searchLower) ||
        new Date(expense.date).toLocaleDateString().toLowerCase().includes(searchLower) ||
        // Related entity fields
        expense.businessUnit?.name.toLowerCase().includes(searchLower) ||
        expense.truck?.number.toLowerCase().includes(searchLower) ||
        expense.trailer?.number.toLowerCase().includes(searchLower) ||
        expense.fuelStation?.name.toLowerCase().includes(searchLower) ||
        // Category and company fields
        expense.category?.toLowerCase().includes(searchLower) ||
        expense.company?.toLowerCase().includes(searchLower) ||
        categoryLabels[expense.category as keyof typeof categoryLabels]?.toLowerCase().includes(searchLower);

      const matchesDateFilter = (() => {
        try {
          if (!dateFilter.from && !dateFilter.to) return true;
          
          const expenseDate = new Date(expense.date);
          if (isNaN(expenseDate.getTime())) return true; // Invalid expense date, show it
          
          // Normalize dates to midnight for accurate comparison
          const normalizedExpenseDate = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());
          
          let fromMatch = true;
          let toMatch = true;
          
          if (dateFilter.from) {
            const fromDate = dateFilter.from instanceof Date ? dateFilter.from : new Date(dateFilter.from);
            if (!isNaN(fromDate.getTime())) {
              const normalizedFromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
              fromMatch = normalizedExpenseDate >= normalizedFromDate;
            }
          }
          
          if (dateFilter.to) {
            const toDate = dateFilter.to instanceof Date ? dateFilter.to : new Date(dateFilter.to);
            if (!isNaN(toDate.getTime())) {
              const normalizedToDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
              toMatch = normalizedExpenseDate <= normalizedToDate;
            }
          }
          
          return fromMatch && toMatch;
        } catch (error) {
          console.warn('Date filter error:', error);
          return true; // Show the item if there's an error
        }
      })();

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

  const totalPrice = filteredExpenses.reduce((sum, expense) => sum + expense.price, 0);

  // Get required fields for this category to show as columns
  const config = CATEGORY_CONFIG_MAP[category];
  const requiredFields = config?.fields || ['date', 'price'];

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
                  <Title order={1}>{categoryLabel} Expenses</Title>
                </Group>
                <Text>
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
                Total: ${totalPrice.toFixed(2)}
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
                  <Text size="lg">No expenses found</Text>
                  <Text size="sm" ta="center">
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
              <>
                {/* Mobile Card View */}
                <Box hiddenFrom="md">
                  <Stack gap="md">
                    {filteredExpenses.map((expense) => (
                      <Card key={expense.id} withBorder shadow="xs" padding="md" radius="md">
                        <Group justify="space-between" align="flex-start" mb="xs">
                          <Checkbox
                            size="sm"
                            checked={selectedIds.includes(expense.id)}
                            onChange={(event) => handleSelectExpense(expense.id, event.currentTarget.checked)}
                          />
                          <Badge color="green" variant="filled" size="md">
                            ${Number(expense.price || 0).toFixed(2)}
                          </Badge>
                        </Group>
                        
                        <Stack gap="xs">
                          <Text fw={700} size="md" c={themeColors.primaryText}>{new Date(expense.date).toLocaleDateString()}</Text>
                          
                          {requiredFields.includes('businessUnit') && expense.businessUnit && (
                            <Text size="sm"><Text fw={600} span>Business Unit:</Text> <Text span ml="xs">{expense.businessUnit.name}</Text></Text>
                          )}
                          {requiredFields.includes('truck') && expense.truck && (
                            <Text size="sm"><Text fw={600} span>Truck:</Text> <Text span ml="xs">{expense.truck.number}</Text></Text>
                          )}
                          {requiredFields.includes('trailer') && expense.trailer && (
                            <Text size="sm"><Text fw={600} span>Trailer:</Text> <Text span ml="xs">{expense.trailer.number}</Text></Text>
                          )}
                          {requiredFields.includes('fuelStation') && expense.fuelStation && (
                            <Text size="sm"><Text fw={600} span>Fuel Station:</Text> <Text span ml="xs">{expense.fuelStation.name}</Text></Text>
                          )}
                          {requiredFields.includes('gallons') && expense.gallons && (
                            <Text size="sm"><Text fw={600} span>Gallons:</Text> <Text span ml="xs">{expense.gallons}</Text></Text>
                          )}
                          {requiredFields.includes('description') && expense.description && (
                            <Text size="sm"><Text fw={600} span>Description:</Text> <Text span ml="xs">{expense.description}</Text></Text>
                          )}
                          {requiredFields.includes('repairDescription') && (expense.repairDescription || expense.repair_description) && (
                            <Text size="sm"><Text fw={600} span>Repair:</Text> <Text span ml="xs">{expense.repairDescription || expense.repair_description}</Text></Text>
                          )}
                          
                          {expense.attachment_path && (
                            <Group gap="xs">
                              <Text fw={600} size="sm" span>Attachment:</Text>
                              <ActionIcon size="sm" variant="light" color="blue" onClick={() => handleDownloadAttachment(expense.id, expense.attachment_path!)}>
                                <IconDownload size={12} />
                              </ActionIcon>
                              <ActionIcon size="sm" variant="light" color="red" onClick={() => handleRemoveAttachment(expense.id)}>
                                <IconX size={12} />
                              </ActionIcon>
                            </Group>
                          )}
                          
                          <Group gap="xs" mt="xs">
                            <ActionIcon variant="light" color="blue" size="sm" onClick={() => handleEditExpense(expense.id)}>
                              <IconEdit size={14} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Box>

                {/* Desktop Table View */}
                <Box visibleFrom="md">
                  <Table.ScrollContainer minWidth={500} type="native">
                    <Table 
                      verticalSpacing="sm" 
                      horizontalSpacing="xs"
                      withTableBorder
                      withColumnBorders
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th w={40}>
                            <Checkbox
                              size="sm"
                              checked={selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                              indeterminate={selectedIds.length > 0 && selectedIds.length < filteredExpenses.length}
                              onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                            />
                          </Table.Th>
                          <Table.Th w={100}><SortButton field="date">Date</SortButton></Table.Th>
                          
                          {/* Dynamic columns based on category */}
                          {requiredFields.includes('businessUnit') && (
                            <Table.Th w={120}>Business Unit</Table.Th>
                          )}
                          {requiredFields.includes('truck') && (
                            <Table.Th w={80}>Truck</Table.Th>
                          )}
                          {requiredFields.includes('trailer') && (
                            <Table.Th w={80}>Trailer</Table.Th>
                          )}
                          {requiredFields.includes('fuelStation') && (
                            <Table.Th w={120}>Fuel Station</Table.Th>
                          )}
                          {requiredFields.includes('gallons') && (
                            <Table.Th w={80}>Gallons</Table.Th>
                          )}
                          {requiredFields.includes('description') && (
                            <Table.Th w={150}>Description</Table.Th>
                          )}
                          {requiredFields.includes('repairDescription') && (
                            <Table.Th w={150}>Repair Description</Table.Th>
                          )}
                          
                          <Table.Th w={100}><SortButton field="price">Price</SortButton></Table.Th>
                          <Table.Th w={100}>Attachment</Table.Th>
                          <Table.Th w={120}>Actions</Table.Th>
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
                        
                        {/* Dynamic columns based on category */}
                        {requiredFields.includes('businessUnit') && (
                          <Table.Td>{expense.businessUnit?.name || '-'}</Table.Td>
                        )}
                        {requiredFields.includes('truck') && (
                          <Table.Td>{expense.truck?.number || '-'}</Table.Td>
                        )}
                        {requiredFields.includes('trailer') && (
                          <Table.Td>{expense.trailer?.number || '-'}</Table.Td>
                        )}
                        {requiredFields.includes('fuelStation') && (
                          <Table.Td>{expense.fuelStation?.name || '-'}</Table.Td>
                        )}
                        {requiredFields.includes('gallons') && (
                          <Table.Td>{expense.gallons || '-'}</Table.Td>
                        )}
                        {requiredFields.includes('description') && (
                          <Table.Td>{expense.description || '-'}</Table.Td>
                        )}
                        {requiredFields.includes('repairDescription') && (
                          <Table.Td>{expense.repair_description || expense.repairDescription || '-'}</Table.Td>
                        )}
                        
                        <Table.Td>
                          <Text fw={500}>${expense.price.toFixed(2)}</Text>
                        </Table.Td>
                        
                        {/* Attachment column */}
                        <Table.Td>
                          {expense.attachment_path ? (
                            <Group gap="xs">
                              <ActionIcon 
                                variant="light" 
                                color="blue"
                                onClick={() => handleDownloadAttachment(expense.id, expense.attachment_path!)}
                                title="Download attachment"
                                size="sm"
                              >
                                <IconDownload size={14} />
                              </ActionIcon>
                              <ActionIcon 
                                variant="light" 
                                color="red"
                                onClick={() => handleRemoveAttachmentClick(expense.id, expense.attachment_path!)}
                                title="Remove attachment"
                                size="sm"
                              >
                                <IconX size={14} />
                              </ActionIcon>
                            </Group>
                          ) : (
                            <Text size="sm">-</Text>
                          )}
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
                </Box>
              </>
            )}
          </Card>
        </Stack>
      </Container>

      {/* Attachment Removal Confirmation Modal */}
      <Modal
        opened={attachmentToRemove !== null}
        onClose={() => setAttachmentToRemove(null)}
        title="Remove Attachment"
        size="sm"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to remove the attachment "{attachmentToRemove?.filename}"? 
            This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button 
              variant="light" 
              onClick={() => setAttachmentToRemove(null)}
            >
              Cancel
            </Button>
            <Button 
              color="red"
              onClick={() => attachmentToRemove && handleRemoveAttachment(attachmentToRemove.id)}
            >
              Remove Attachment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Layout>
  );
}
