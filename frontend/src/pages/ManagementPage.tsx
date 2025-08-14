import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Title,
  Button,
  Stack,
  Group,
  TextInput,
  Alert,
  Box,
  ActionIcon,
  Text,
  Flex,
  Table,
  Modal,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconAlertCircle, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { managementService } from '../services/api';

interface ManagementItem {
  id: number;
  name?: string;
  number?: string;
  created_at: string;
}

interface ManagementFormData {
  name?: string;
  number?: string;
}

const managementConfigs = {
  'business-units': {
    title: 'Business Units',
    singular: 'Business Unit',
    field: 'name',
    placeholder: 'Enter business unit name',
    icon: '🏢',
    color: 'blue'
  },
  trucks: {
    title: 'Trucks',
    singular: 'Truck',
    field: 'number',
    placeholder: 'Enter truck number',
    icon: '🚛',
    color: 'green'
  },
  trailers: {
    title: 'Trailers',
    singular: 'Trailer',
    field: 'number',
    placeholder: 'Enter trailer number',
    icon: '🚚',
    color: 'orange'
  },
  'fuel-stations': {
    title: 'Fuel Stations',
    singular: 'Fuel Station',
    field: 'name',
    placeholder: 'Enter fuel station name',
    icon: '⛽',
    color: 'teal'
  }
} as const;

export function ManagementPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<ManagementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<ManagementItem | null>(null);

  const form = useForm<ManagementFormData>({
    initialValues: {
      name: '',
      number: '',
    },
  });

  if (!type || !(type in managementConfigs)) {
    navigate('/dashboard');
    return null;
  }

  const config = managementConfigs[type as keyof typeof managementConfigs];

  // Update form validation based on config
  const validateForm = (values: ManagementFormData) => {
    const errors: Partial<ManagementFormData> = {};
    
    if (config.field === 'name' && (!values.name || values.name.trim() === '')) {
      errors.name = `${config.singular} name is required`;
    }
    if (config.field === 'number' && (!values.number || values.number.trim() === '')) {
      errors.number = `${config.singular} number is required`;
    }
    
    return errors;
  };

  const handleSubmit = async (values: ManagementFormData) => {
    const errors = validateForm(values);
    if (Object.keys(errors).length > 0) {
      form.setErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement API call to save item
      console.log('Saving item:', { type, values, editingItem });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock adding item to list
      const newItem: ManagementItem = {
        id: Date.now(),
        [config.field]: values[config.field as keyof ManagementFormData],
        created_at: new Date().toISOString()
      };
      
      if (editingItem) {
        setItems(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { ...item, [config.field]: values[config.field as keyof ManagementFormData] }
            : item
        ));
      } else {
        setItems(prev => [...prev, newItem]);
      }
      
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to save ${config.singular.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ManagementItem) => {
    setEditingItem(item);
    form.setValues({
      [config.field]: item[config.field as keyof ManagementItem] as string
    });
    setModalOpened(true);
  };

  const handleDelete = async (item: ManagementItem) => {
    if (confirm(`Are you sure you want to delete this ${config.singular.toLowerCase()}?`)) {
      // TODO: Implement API call to delete item
      console.log('Deleting item:', item);
      
      // Mock delete
      setItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingItem(null);
    form.reset();
    setError(null);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <Layout>
      <Container size="lg" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="md">
              <ActionIcon variant="light" size="lg" onClick={handleBack}>
                <IconArrowLeft size={18} />
              </ActionIcon>
              <Box>
                <Group gap="sm">
                  <Text size="2rem">{config.icon}</Text>
                  <Title order={1}>{config.title}</Title>
                </Group>
                <Text c="dimmed">Manage {config.title.toLowerCase()}</Text>
              </Box>
            </Group>
            
            <Button
              leftSection={<IconPlus size={16} />}
              color={config.color}
              onClick={() => setModalOpened(true)}
            >
              Add {config.singular}
            </Button>
          </Flex>

          {/* Items Table */}
          <Card shadow="sm" padding="xl" radius="md">
            {items.length === 0 ? (
              <Stack align="center" gap="md" py="xl">
                <Text size="lg" c="dimmed">No {config.title.toLowerCase()} found</Text>
                <Text size="sm" c="dimmed" ta="center">
                  Start by adding your first {config.singular.toLowerCase()}
                </Text>
                <Button 
                  variant="light" 
                  color={config.color}
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setModalOpened(true)}
                >
                  Add {config.singular}
                </Button>
              </Stack>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{config.field === 'name' ? 'Name' : 'Number'}</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>{item[config.field as keyof ManagementItem]}</Table.Td>
                      <Table.Td>{new Date(item.created_at).toLocaleDateString()}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => handleDelete(item)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Stack>

        {/* Add/Edit Modal */}
        <Modal
          opened={modalOpened}
          onClose={handleCloseModal}
          title={`${editingItem ? 'Edit' : 'Add'} ${config.singular}`}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <TextInput
                label={config.field === 'name' ? 'Name' : 'Number'}
                placeholder={config.placeholder}
                required
                {...form.getInputProps(config.field)}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="light" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={loading}
                  color={config.color}
                >
                  {editingItem ? 'Update' : 'Add'} {config.singular}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Container>
    </Layout>
  );
}
