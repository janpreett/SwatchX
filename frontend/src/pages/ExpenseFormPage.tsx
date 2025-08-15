import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { ExpenseForm } from '../components/ExpenseForm';
import { expenseService } from '../services/api';
import { useCompany } from '../hooks/useCompany';

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

export function ExpenseFormPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const returnTo = searchParams.get('returnTo') || `/tables/${category}`;
  const [initialData, setInitialData] = useState<ExpenseFormData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load existing expense data if editing
  useEffect(() => {
    if (editId) {
      const loadExpense = async () => {
        setLoading(true);
        try {
          const expense = await expenseService.getById(Number(editId));
          setInitialData(expense);
        } catch (error) {
          console.error('Failed to load expense:', error);
        } finally {
          setLoading(false);
        }
      };
      loadExpense();
    }
  }, [editId]);

  if (!category || !(category in categoryLabels)) {
    navigate('/dashboard');
    return null;
  }

  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels];

  const handleSubmit = async (data: ExpenseFormData) => {
    if (!selectedCompany) {
      throw new Error('No company selected');
    }

    // Prepare expense data (without attachment)
    const expenseData = {
      company: selectedCompany,
      category: category,
      date: data.date instanceof Date ? data.date.toISOString() : new Date(data.date || new Date()).toISOString(),
      price: Number(data.price),
      description: data.description || undefined,
      gallons: data.gallons ? Number(data.gallons) : undefined,
      serviceProviderId: data.serviceProviderId ? Number(data.serviceProviderId) : undefined,
      truckId: data.truckId ? Number(data.truckId) : undefined,
      trailerId: data.trailerId ? Number(data.trailerId) : undefined,
      fuelStationId: data.fuelStationId ? Number(data.fuelStationId) : undefined,
    };

    // Handle attachment logic
    let attachmentToSend: File | null = null;
    
    if (data.removeCurrentAttachment) {
      // If removing current attachment, don't send a file but still use updateWithFile to clear it
      attachmentToSend = null;
    } else if (data.attachment) {
      // If new file selected, send it
      attachmentToSend = data.attachment;
    }

    if (editId) {
      // For edits, always use updateWithFile to handle attachment changes
      await expenseService.updateWithFile(Number(editId), expenseData, attachmentToSend);
      notifications.show({
        title: 'Success!',
        message: 'Expense updated successfully',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
    } else {
      await expenseService.createWithFile(expenseData, attachmentToSend);
      notifications.show({
        title: 'Success!',
        message: 'Expense created successfully',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
    }
  };

  return (
    <ExpenseForm
      category={category}
      categoryLabel={categoryLabel}
      onSubmit={handleSubmit}
      initialData={initialData || undefined}
      isEditing={!!editId}
      loading={loading}
      returnTo={returnTo}
    />
  );
}
