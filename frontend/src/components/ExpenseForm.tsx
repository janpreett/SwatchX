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
  Flex
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconAlertCircle, IconCheck, IconCalendar } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { useCompany } from '../hooks/useCompany';
import { managementService } from '../services/api';

interface ExpenseFormData {
  date: Date | null;
  cost: number | '';
  description?: string;
  repairDescription?: string;
  gallons?: number | '';
  businessUnitId?: string | null;
  truckId?: string | null;
  trailerId?: string | null;
  fuelStationId?: string | null;
}

interface ExpenseFormProps {
  category: string;
  categoryLabel: string;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
  loading?: boolean;
}

type FieldType = 'date' | 'businessUnit' | 'truck' | 'trailer' | 'repairDescription' | 'cost' | 'fuelStation' | 'gallons' | 'description';

const categoryConfigs = {
  truck: {
    fields: ['date', 'businessUnit', 'truck', 'repairDescription', 'cost'] as FieldType[],
    icon: '🚛',
    color: 'blue'
  },
  trailer: {
    fields: ['date', 'businessUnit', 'trailer', 'repairDescription', 'cost'] as FieldType[],
    icon: '🚚',
    color: 'green'
  },
  'fuel-diesel': {
    fields: ['date', 'fuelStation', 'gallons', 'cost'] as FieldType[],
    icon: '⛽',
    color: 'teal'
  },
  dmv: {
    fields: ['date', 'description', 'cost'] as FieldType[],
    icon: '📋',
    color: 'orange'
  },
  parts: {
    fields: ['date', 'description', 'cost'] as FieldType[],
    icon: '🔧',
    color: 'red'
  },
  'phone-tracker': {
    fields: ['date', 'description', 'cost'] as FieldType[],
    icon: '📱',
    color: 'purple'
  },
  'other-expenses': {
    fields: ['date', 'description', 'cost'] as FieldType[],
    icon: '💼',
    color: 'gray'
  },
  toll: {
    fields: ['date', 'cost'] as FieldType[],
    icon: '🛣️',
    color: 'yellow'
  },
  'office-supplies': {
    fields: ['date', 'description', 'cost'] as FieldType[],
    icon: '📝',
    color: 'pink'
  },
  def: {
    fields: ['date', 'cost'] as FieldType[],
    icon: '🧪',
    color: 'indigo'
  }
} as const;

export function ExpenseForm({ category, categoryLabel, onSubmit, initialData, isEditing, loading: formLoading }: ExpenseFormProps) {
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Management data state
  const [businessUnits, setBusinessUnits] = useState<Array<{value: string, label: string}>>([]);
  const [trucks, setTrucks] = useState<Array<{value: string, label: string}>>([]);
  const [trailers, setTrailers] = useState<Array<{value: string, label: string}>>([]);
  const [fuelStations, setFuelStations] = useState<Array<{value: string, label: string}>>([]);

  const config = categoryConfigs[category as keyof typeof categoryConfigs];
  const requiredFields = config?.fields || ['date', 'cost'] as FieldType[];

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

        setBusinessUnits(businessUnitsData.map((item: any) => ({ value: item.id.toString(), label: item.name || item.number })));
        setTrucks(trucksData.map((item: any) => ({ value: item.id.toString(), label: item.number })));
        setTrailers(trailersData.map((item: any) => ({ value: item.id.toString(), label: item.number })));
        setFuelStations(fuelStationsData.map((item: any) => ({ value: item.id.toString(), label: item.name })));
      } catch (error) {
        console.error('Failed to load management data:', error);
      }
    };

    loadManagementData();
  }, []);

  const form = useForm<ExpenseFormData>({
    initialValues: {
      date: new Date(),
      cost: '',
      description: '',
      repairDescription: '',
      gallons: '',
      businessUnitId: null,
      truckId: null,
      trailerId: null,
      fuelStationId: null,
    },
    validate: {
      date: (value) => (!value ? 'Date is required' : null),
      cost: (value) => {
        if (!value && value !== 0) return 'Cost is required';
        if (typeof value === 'number' && value <= 0) return 'Cost must be greater than 0';
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
        cost: initialData.cost || '',
        description: initialData.description || '',
        repairDescription: initialData.repair_description || '',
        gallons: initialData.gallons || '',
        businessUnitId: initialData.business_unit_id?.toString() || null,
        truckId: initialData.truck_id?.toString() || null,
        trailerId: initialData.trailer_id?.toString() || null,
        fuelStationId: initialData.fuel_station_id?.toString() || null,
      });
    }
  }, [initialData, isEditing]);

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
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
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
            <Box>
              <Title order={1}>{isEditing ? 'Edit' : 'Add'} {categoryLabel}</Title>
              <Text c="dimmed">
                {selectedCompany} • {isEditing ? 'Update existing' : 'New'} expense entry
              </Text>
            </Box>
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
                  maxDate={new Date()}
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
                    maxRows={5}
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
                    maxRows={5}
                    {...form.getInputProps('repairDescription')}
                  />
                )}

                {/* Cost - always required */}
                <NumberInput
                  label="Cost (USD)"
                  placeholder="Enter cost"
                  required
                  min={0}
                  decimalScale={2}
                  prefix="$"
                  {...form.getInputProps('cost')}
                />

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
    </Layout>
  );
}
