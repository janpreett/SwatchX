import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Title,
  Button,
  Stack,
  Group,
  Select,
  NumberInput,
  Textarea,
  Alert,
  Box,
  ActionIcon,
  Text,
  Flex,
  FileInput,
  Modal
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconAlertCircle, IconCheck, IconCalendar, IconPaperclip, IconTrash } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useCompany } from '../hooks/useCompany';
import { managementService } from '../services/api';
import { CATEGORY_CONFIG_MAP } from '../constants/expenseCategories';

interface ExpenseFormData {
  date: Date | null;
  price: number | '';
  description?: string;
  gallons?: number | '';
  serviceProviderId?: string | null;
  truckId?: string | null;
  trailerId?: string | null;
  fuelStationId?: string | null;
  attachment?: File | null;
  attachmentPath?: string;
  removeCurrentAttachment?: boolean;
}

interface ExpenseFormProps {
  category: string;
  categoryLabel: string;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  initialData?: ExpenseFormData;
  isEditing?: boolean;
  loading?: boolean;
  returnTo?: string;
}

type FieldType = 'date' | 'serviceProviderId' | 'truckId' | 'trailerId' | 'price' | 'fuelStationId' | 'gallons' | 'description';

export function ExpenseForm({ category, categoryLabel, onSubmit, initialData, isEditing, loading: formLoading, returnTo = '/dashboard' }: ExpenseFormProps) {
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  
  // Management data state
  const [serviceProviders, setServiceProviders] = useState<Array<{value: string, label: string}>>([]);
  const [trucks, setTrucks] = useState<Array<{value: string, label: string}>>([]);
  const [trailers, setTrailers] = useState<Array<{value: string, label: string}>>([]);
  const [fuelStations, setFuelStations] = useState<Array<{value: string, label: string}>>([]);

  const config = CATEGORY_CONFIG_MAP[category];
  const requiredFields = config?.fields || ['date', 'price'] as FieldType[];

  // Load management data on component mount
  useEffect(() => {
    const loadManagementData = async () => {
      try {
        // Loading management data...
        const [serviceProvidersData, trucksData, trailersData, fuelStationsData] = await Promise.all([
          managementService.getServiceProviders(),
          managementService.getTrucks(),
          managementService.getTrailers(),
          managementService.getFuelStations(),
        ]);

        // Data loaded successfully

        setServiceProviders(serviceProvidersData.map((item: { id: number; name: string }) => ({ value: item.id.toString(), label: item.name })));
        setTrucks(trucksData.map((item: { id: number; number: string }) => ({ value: item.id.toString(), label: item.number })));
        setTrailers(trailersData.map((item: { id: number; number: string }) => ({ value: item.id.toString(), label: item.number })));
        setFuelStations(fuelStationsData.map((item: { id: number; name: string }) => ({ value: item.id.toString(), label: item.name })));
      } catch (error) {
        console.error('Failed to load management data:', error);
        // Set error state to show user that management data couldn't be loaded
        setError('Failed to load management data. Please refresh the page or contact support.');
      }
    };

    loadManagementData();
  }, []);

  const form = useForm<ExpenseFormData>({
    initialValues: {
      date: new Date(),
      price: '',
      description: '',
      gallons: '',
      serviceProviderId: null,
      truckId: null,
      trailerId: null,
      fuelStationId: null,
      attachment: null,
      attachmentPath: undefined,
      removeCurrentAttachment: false,
    },
    validate: {
      date: (value) => (!value ? 'Date is required' : null),
          price: (value) => {
      if (requiredFields.includes('price')) {
        if (!value && value !== 0) return 'Price is required';
        if (typeof value === 'number' && value <= 0) return 'Price must be greater than 0';
      }
      return null;
    },
      description: (value) => {
        if (requiredFields.includes('description') && (!value || value.trim() === '')) {
          return 'Description is required';
        }
        return null;
      },
      gallons: (value) => {
        if (requiredFields.includes('gallons') && (!value && value !== 0)) {
          return 'Gallons is required';
        }
        if (typeof value === 'number' && value <= 0) return 'Gallons must be greater than 0';
        return null;
      },
      serviceProviderId: (value) => {
        if (requiredFields.includes('serviceProviderId') && !value) {
          return 'Service provider is required';
        }
        return null;
      },
      truckId: (value) => {
        if (requiredFields.includes('truckId') && !value) {
          return 'Truck is required';
        }
        return null;
      },
      trailerId: (value) => {
        if (requiredFields.includes('trailerId') && !value) {
          return 'Trailer is required';
        }
        return null;
      },
      fuelStationId: (value) => {
        if (requiredFields.includes('fuelStationId') && !value) {
          return 'Fuel station is required';
        }
        return null;
      },
    },
  });

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      form.setValues({
        date: initialData.date ? new Date(initialData.date) : new Date(),
        price: initialData.price || '',
        description: initialData.description || '',
        gallons: initialData.gallons || '',
        serviceProviderId: initialData.serviceProviderId?.toString() || null,
        truckId: initialData.truckId?.toString() || null,
        trailerId: initialData.trailerId?.toString() || null,
        fuelStationId: initialData.fuelStationId?.toString() || null,
        attachmentPath: initialData.attachmentPath,
        removeCurrentAttachment: false,
        attachment: null,
      });
    }
  }, [initialData, isEditing]);

  // Early return after hooks
  if (!selectedCompany) {
    navigate('/home');
    return null;
  }

  const handleSubmit = async (values: ExpenseFormData) => {
    setError(null);

    try {
      await onSubmit(values);
      setSuccess(true);
      setTimeout(() => {
        navigate(returnTo);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense');
    }
  };

  const handleBack = () => {
    navigate(returnTo);
  };

  if (success) {
    return (
      <Layout>
        <Container size="sm" py="xl">
          <Card shadow="sm" padding="xl" radius="md">
            <Stack align="center" gap="lg">
              <Box
                w={80}
                h={80}
                bg="green.6"
                style={{
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconCheck size={40} color="white" />
              </Box>
              <Title order={2} ta="center" c="green">
                Expense {isEditing ? 'Updated' : 'Added'} Successfully!
              </Title>
              <Text ta="center" c="dimmed">
                Your {categoryLabel} expense has been {isEditing ? 'updated' : 'saved'} for {selectedCompany}.
              </Text>
            </Stack>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="sm" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Flex align="center" gap="md">
            <ActionIcon variant="light" size="lg" onClick={handleBack}>
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Group gap="md">
              {config?.icon && <Text size="3xl" lh={1}>{config.icon}</Text>}
              <Box>
                <Title order={1} c={config?.color || 'blue'}>
                  {isEditing ? 'Edit' : 'Add'} {categoryLabel}
                </Title>
                <Text c="dimmed">
                  {selectedCompany} • {isEditing ? 'Update existing' : 'New'} expense entry
                </Text>
              </Box>
            </Group>
          </Flex>

          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
              {error}
            </Alert>
          )}

          {/* Form */}
          <Card shadow="sm" padding="xl" radius="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                {/* Date field - always required */}
                <DateInput
                  label="Date"
                  placeholder="Select date"
                  leftSection={<IconCalendar size="1rem" />}
                  required
                  {...form.getInputProps('date')}
                />

                {/* Service Provider - for truck/trailer */}
                {requiredFields.includes('serviceProviderId') && (
                  <Select
                    label="Service Provider"
                    placeholder="Select service provider"
                    required
                    data={serviceProviders}
                    {...form.getInputProps('serviceProviderId')}
                  />
                )}

                {/* Truck - for truck expenses */}
                {requiredFields.includes('truckId') && (
                  <Select
                    label="Truck Number"
                    placeholder="Select truck"
                    required
                    data={trucks}
                    {...form.getInputProps('truckId')}
                  />
                )}

                {/* Trailer - for trailer expenses */}
                {requiredFields.includes('trailerId') && (
                  <Select
                    label="Trailer Number"
                    placeholder="Select trailer"
                    required
                    data={trailers}
                    {...form.getInputProps('trailerId')}
                  />
                )}

                {/* Fuel Station - for fuel expenses */}
                {requiredFields.includes('fuelStationId') && (
                  <Select
                    label="Fuel Station"
                    placeholder="Select fuel station"
                    required
                    data={fuelStations}
                    {...form.getInputProps('fuelStationId')}
                  />
                )}

                {/* Gallons - for fuel expenses */}
                {requiredFields.includes('gallons') && (
                  <NumberInput
                    label="Gallons"
                    placeholder="Enter gallons"
                    required
                    min={0}
                    decimalScale={2}
                    {...form.getInputProps('gallons')}
                  />
                )}

                {/* Description - for most categories */}
                {requiredFields.includes('description') && (
                  <Textarea
                    label="Description"
                    placeholder="Enter description"
                    required
                    minRows={3}
                    maxRows={10}
                    resize="vertical"
                    {...form.getInputProps('description')}
                  />
                )}

                {/* File attachment - optional for all categories */}
                <Stack gap="xs">
                  {/* Show current attachment if editing */}
                  {isEditing && form.values.attachmentPath && !form.values.removeCurrentAttachment && (
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Current Attachment</Text>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {form.values.attachmentPath.split('/').pop()}
                        </Text>
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => setShowRemoveConfirmation(true)}
                          title="Remove current attachment"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Box>
                  )}
                  
                  {/* Show removed attachment message */}
                  {isEditing && form.values.removeCurrentAttachment && (
                    <Alert color="orange" variant="light">
                      <Group justify="space-between">
                        <Text size="sm">Current attachment will be removed when you save</Text>
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => form.setFieldValue('removeCurrentAttachment', false)}
                        >
                          Undo
                        </Button>
                      </Group>
                    </Alert>
                  )}
                  
                  {/* File input for new attachment */}
                  <FileInput
                    label={isEditing && form.values.attachmentPath && !form.values.removeCurrentAttachment ? "Replace Attachment (Optional)" : "Attachment (Optional)"}
                    description="Upload a PDF or image file (max 10MB)"
                    placeholder="Choose file..."
                    leftSection={<IconPaperclip size="1rem" />}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
                    clearable
                    {...form.getInputProps('attachment')}
                  />
                </Stack>

                {/* Price field */}
                {requiredFields.includes('price') && (
                  <NumberInput
                    label="Price (USD)"
                    placeholder="Enter price"
                    required
                    min={0}
                    decimalScale={2}
                    prefix="$"
                    {...form.getInputProps('price')}
                  />
                )}

                {/* Submit buttons */}
                <Group justify="flex-end" mt="md">
                  <Button variant="light" onClick={handleBack}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    loading={formLoading}
                    color={config?.color}
                  >
                    {isEditing ? 'Update' : 'Add'} Expense
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>

      {/* Attachment Removal Confirmation Modal */}
      <Modal
        opened={showRemoveConfirmation}
        onClose={() => setShowRemoveConfirmation(false)}
        title="Remove Attachment"
        size="sm"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to remove the current attachment "{form.values.attachmentPath?.split('/').pop()}"? 
            This action will be applied when you save the expense.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button 
              variant="light" 
              onClick={() => setShowRemoveConfirmation(false)}
            >
              Cancel
            </Button>
            <Button 
              color="red"
              onClick={() => {
                form.setFieldValue('removeCurrentAttachment', true);
                setShowRemoveConfirmation(false);
              }}
            >
              Remove Attachment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Layout>
  );
}
