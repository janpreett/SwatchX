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

interface ManagementDataItem {
  id: number;
  name?: string;
  number?: string;
}

export interface ExpenseInitialData {
  date?: string | Date;
  price?: number | string;
  description?: string;
  repair_description?: string;
  gallons?: number | string;
  business_unit_id?: number | string;
  truck_id?: number | string;
  trailer_id?: number | string;
  fuel_station_id?: number | string;
  attachment_path?: string;
}

interface ExpenseFormData {
  date: Date | null;
  price: number | '';
  description?: string;
  repairDescription?: string;
  gallons?: number | '';
  businessUnitId?: string | null;
  truckId?: string | null;
  trailerId?: string | null;
  fuelStationId?: string | null;
  attachment?: File | null;
  currentAttachmentPath?: string;
  removeCurrentAttachment?: boolean;
}

interface ExpenseFormProps {
  category: string;
  categoryLabel: string;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  initialData?: ExpenseInitialData;
  isEditing?: boolean;
  loading?: boolean;
  returnTo?: string;
}

type FieldType = 'date' | 'businessUnit' | 'truck' | 'trailer' | 'repairDescription' | 'price' | 'fuelStation' | 'gallons' | 'description';

export function ExpenseForm({ category, categoryLabel, onSubmit, initialData, isEditing, returnTo = '/dashboard' }: ExpenseFormProps) {
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  
  // Management data state
  const [businessUnits, setBusinessUnits] = useState<Array<{value: string, label: string}>>([]);
  const [trucks, setTrucks] = useState<Array<{value: string, label: string}>>([]);
  const [trailers, setTrailers] = useState<Array<{value: string, label: string}>>([]);
  const [fuelStations, setFuelStations] = useState<Array<{value: string, label: string}>>([]);

  const config = CATEGORY_CONFIG_MAP[category];
  const requiredFields = config?.fields || ['date', 'price'] as FieldType[];

  // Load management data on component mount
  useEffect(() => {
    const loadManagementData = async () => {
      try {
        console.log('Loading management data...');
        const [businessUnitsData, trucksData, trailersData, fuelStationsData] = await Promise.all([
          managementService.getBusinessUnits(),
          managementService.getTrucks(),
          managementService.getTrailers(),
          managementService.getFuelStations(),
        ]);

        console.log('Business Units:', businessUnitsData);
        console.log('Trucks:', trucksData);
        console.log('Trailers:', trailersData);
        console.log('Fuel Stations:', fuelStationsData);

        setBusinessUnits(businessUnitsData.map((item: ManagementDataItem) => ({ value: item.id.toString(), label: item.name || item.number })));
        setTrucks(trucksData.map((item: ManagementDataItem) => ({ value: item.id.toString(), label: item.number })));
        setTrailers(trailersData.map((item: ManagementDataItem) => ({ value: item.id.toString(), label: item.number })));
        setFuelStations(fuelStationsData.map((item: ManagementDataItem) => ({ value: item.id.toString(), label: item.name })));
      } catch (error) {
        console.error('Failed to load management data:', error);
      }
    };

    loadManagementData();
  }, []);

  const form = useForm<ExpenseFormData>({
    initialValues: {
      date: new Date(),
      price: '',
      description: '',
      repairDescription: '',
      gallons: '',
      businessUnitId: null,
      truckId: null,
      trailerId: null,
      fuelStationId: null,
      attachment: null,
      currentAttachmentPath: undefined,
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
      repairDescription: (value) => {
        if (requiredFields.includes('repairDescription') && (!value || value.trim() === '')) {
          return 'Repair description is required';
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
      businessUnitId: (value) => {
        if (requiredFields.includes('businessUnit') && !value) {
          return 'Business unit is required';
        }
        return null;
      },
      truckId: (value) => {
        if (requiredFields.includes('truck') && !value) {
          return 'Truck is required';
        }
        return null;
      },
      trailerId: (value) => {
        if (requiredFields.includes('trailer') && !value) {
          return 'Trailer is required';
        }
        return null;
      },
      fuelStationId: (value) => {
        if (requiredFields.includes('fuelStation') && !value) {
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
        price: typeof initialData.price === 'number' ? initialData.price : (initialData.price ? parseFloat(initialData.price) : ''),
        description: initialData.description || '',
        repairDescription: initialData.repair_description || '',
        gallons: typeof initialData.gallons === 'number' ? initialData.gallons : (initialData.gallons ? parseFloat(initialData.gallons) : ''),
        businessUnitId: initialData.business_unit_id?.toString() || null,
        truckId: initialData.truck_id?.toString() || null,
        trailerId: initialData.trailer_id?.toString() || null,
        fuelStationId: initialData.fuel_station_id?.toString() || null,
        currentAttachmentPath: initialData.attachment_path,
        removeCurrentAttachment: false,
        attachment: null,
      });
    }
  }, [initialData, isEditing, form]);

  // Early return after hooks
  if (!selectedCompany) {
    navigate('/home');
    return null;
  }

  const handleSubmit = async (values: ExpenseFormData) => {
    setLoading(true);
    setError(null);

    try {
      await onSubmit(values);
      setSuccess(true);
      setTimeout(() => {
        navigate(returnTo);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setLoading(false);
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

                {/* Business Unit - for truck/trailer */}
                {requiredFields.includes('businessUnit') && (
                  <Select
                    label="Business Unit"
                    placeholder="Select business unit"
                    required
                    data={businessUnits}
                    {...form.getInputProps('businessUnitId')}
                  />
                )}

                {/* Truck - for truck expenses */}
                {requiredFields.includes('truck') && (
                  <Select
                    label="Truck Number"
                    placeholder="Select truck"
                    required
                    data={trucks}
                    {...form.getInputProps('truckId')}
                  />
                )}

                {/* Trailer - for trailer expenses */}
                {requiredFields.includes('trailer') && (
                  <Select
                    label="Trailer Number"
                    placeholder="Select trailer"
                    required
                    data={trailers}
                    {...form.getInputProps('trailerId')}
                  />
                )}

                {/* Fuel Station - for fuel expenses */}
                {requiredFields.includes('fuelStation') && (
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

                {/* Repair Description - for truck/trailer */}
                {requiredFields.includes('repairDescription') && (
                  <Textarea
                    label="Repair Description"
                    placeholder="Describe the repair work"
                    required
                    minRows={3}
                    maxRows={10}
                    resize="vertical"
                    {...form.getInputProps('repairDescription')}
                  />
                )}

                {/* File attachment - optional for all categories */}
                <Stack gap="xs">
                  {/* Show current attachment if editing */}
                  {isEditing && form.values.currentAttachmentPath && !form.values.removeCurrentAttachment && (
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Current Attachment</Text>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {form.values.currentAttachmentPath.split('/').pop()}
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
                    label={isEditing && form.values.currentAttachmentPath && !form.values.removeCurrentAttachment ? "Replace Attachment (Optional)" : "Attachment (Optional)"}
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
                    loading={loading}
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
            Are you sure you want to remove the current attachment "{form.values.currentAttachmentPath?.split('/').pop()}"? 
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
