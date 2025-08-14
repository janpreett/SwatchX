import { useState, useEffect } from 'react';
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
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconAlertCircle, IconPlus, IconEdit, IconTrash, IconCheck } from '@tabler/icons-react';
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const form = useForm<ManagementFormData>({
    initialValues: {
      name: '',
      number: '',
    },
  });

  // Load existing items from API
  useEffect(() => {
    if (!type || !(type in managementConfigs)) {
      return;
    }
    
    const loadItems = async () => {
      setLoading(true);
      try {
        let data;
        if (type === 'business-units') {
          data = await managementService.getBusinessUnits();
        } else if (type === 'trucks') {
          data = await managementService.getTrucks();
        } else if (type === 'trailers') {
          data = await managementService.getTrailers();
        } else if (type === 'fuel-stations') {
          data = await managementService.getFuelStations();
        }
        
        setItems(data || []);
      } catch (error) {
        console.error('Failed to load items:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [type]);

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
      let updatedItem: ManagementItem | undefined;
      
      // Call appropriate API based on type and whether we're editing or creating
      if (editingItem) {
        // Update existing item
        if (type === 'business-units') {
          updatedItem = await managementService.updateBusinessUnit(editingItem.id, { name: values.name || '' });
        } else if (type === 'trucks') {
          updatedItem = await managementService.updateTruck(editingItem.id, { number: values.number || '' });
        } else if (type === 'trailers') {
          updatedItem = await managementService.updateTrailer(editingItem.id, { number: values.number || '' });
        } else if (type === 'fuel-stations') {
          updatedItem = await managementService.updateFuelStation(editingItem.id, { name: values.name || '' });
        }
        
        if (updatedItem) {
          setItems(prev => prev.map(item => 
            item.id === editingItem.id ? updatedItem! : item
          ));
          notifications.show({
            title: 'Success!',
            message: `${config.singular} updated successfully`,
            color: 'green',
            icon: <IconCheck size="1rem" />,
          });
        }
      } else {
        // Create new item  
        let newItem: ManagementItem | undefined;
        if (type === 'business-units') {
          newItem = await managementService.createBusinessUnit({ name: values.name || '' });
        } else if (type === 'trucks') {
          newItem = await managementService.createTruck({ number: values.number || '' });
        } else if (type === 'trailers') {
          newItem = await managementService.createTrailer({ number: values.number || '' });
        } else if (type === 'fuel-stations') {
          newItem = await managementService.createFuelStation({ name: values.name || '' });
        }
        
        if (newItem) {
          setItems(prev => [...prev, newItem]);
          notifications.show({
            title: 'Success!',
            message: `${config.singular} created successfully`,
            color: 'green',
            icon: <IconCheck size="1rem" />,
          });
        }
      }
      
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save item:', err);
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
    setError(null); // Clear any previous errors when opening edit modal
    setModalOpened(true);
  };

  const handleDelete = async (item: ManagementItem) => {
    if (confirm(`Are you sure you want to delete this ${config.singular.toLowerCase()}?`)) {
      setError(null); // Clear any previous errors
      try {
        if (type === 'business-units') {
          await managementService.deleteBusinessUnit(item.id);
        } else if (type === 'trucks') {
          await managementService.deleteTruck(item.id);
        } else if (type === 'trailers') {
          await managementService.deleteTrailer(item.id);
        } else if (type === 'fuel-stations') {
          await managementService.deleteFuelStation(item.id);
        }
        
        // Remove from local state
        setItems(prev => prev.filter(i => i.id !== item.id));
        notifications.show({
          title: 'Deleted!',
          message: `${config.singular} deleted successfully`,
          color: 'red',
          icon: <IconTrash size="1rem" />,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('expense(s) reference it')) {
          setError(`Cannot delete this ${config.singular.toLowerCase()}: it is being used by existing expenses. Please remove those expenses first.`);
        } else {
          setError(`Failed to delete ${config.singular.toLowerCase()}: ${errorMessage}`);
        }
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} ${config.singular.toLowerCase()}(s)?`)) {
      setError(null); // Clear any previous errors
      const deleteResults: { success: number; failed: { id: number; name: string; error: string }[] } = {
        success: 0,
        failed: []
      };
      
      for (const id of selectedIds) {
        try {
          if (type === 'business-units') {
            await managementService.deleteBusinessUnit(id);
          } else if (type === 'trucks') {
            await managementService.deleteTruck(id);
          } else if (type === 'trailers') {
            await managementService.deleteTrailer(id);
          } else if (type === 'fuel-stations') {
            await managementService.deleteFuelStation(id);
          }
          deleteResults.success++;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const item = items.find(i => i.id === id);
          const itemName = item?.[config.field as keyof ManagementItem] as string || `ID ${id}`;
          deleteResults.failed.push({
            id,
            name: itemName,
            error: errorMessage
          });
        }
      }
      
      // Remove successfully deleted items from local state
      if (deleteResults.success > 0) {
        setItems(prev => prev.filter(item => !selectedIds.includes(item.id) || deleteResults.failed.some(f => f.id === item.id)));
        setSelectedIds([]);
        notifications.show({
          title: 'Success!',
          message: `${deleteResults.success} ${config.singular.toLowerCase()}(s) deleted successfully`,
          color: 'green',
          icon: <IconCheck size="1rem" />,
        });
      }
      
      // Show results
      if (deleteResults.failed.length > 0 && deleteResults.success > 0) {
        const failedNames = deleteResults.failed.map(f => f.name).join(', ');
        setError(`${deleteResults.success} ${config.singular.toLowerCase()}(s) deleted successfully. Failed to delete: ${failedNames} (they are being used by existing expenses).`);
      } else if (deleteResults.failed.length > 0) {
        const failedNames = deleteResults.failed.map(f => f.name).join(', ');
        setError(`Failed to delete: ${failedNames}. They are being used by existing expenses. Please remove those expenses first.`);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingItem(null);
    form.reset();
    setError(null);
  };

  const handleBack = () => {
    navigate('/management');
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
            
            <Group gap="sm">
              <Button
                leftSection={<IconPlus size={16} />}
                color={config.color}
                onClick={() => {
                  setError(null); // Clear any previous errors when opening add modal
                  setModalOpened(true);
                }}
              >
                Add {config.singular}
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

          {/* Error Message */}
          {error && (
            <Alert color="red" title="Error" variant="light">
              {error}
            </Alert>
          )}

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
                  onClick={() => {
                    setError(null); // Clear any previous errors
                    setModalOpened(true);
                  }}
                >
                  Add {config.singular}
                </Button>
              </Stack>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={50}>
                      <Checkbox
                        checked={selectedIds.length === items.length && items.length > 0}
                        indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
                        onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                      />
                    </Table.Th>
                    <Table.Th>{config.field === 'name' ? 'Name' : 'Number'}</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onChange={(event) => handleSelectItem(item.id, event.currentTarget.checked)}
                        />
                      </Table.Td>
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
