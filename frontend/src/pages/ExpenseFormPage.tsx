import { useParams, useNavigate } from 'react-router-dom';
import { ExpenseForm } from '../components/ExpenseForm';

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

  if (!category || !(category in categoryLabels)) {
    navigate('/dashboard');
    return null;
  }

  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels];

  const handleSubmit = async (data: ExpenseFormData) => {
    // TODO: Implement API call to save expense
    console.log('Saving expense:', { category, data });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, just log the data
    // This will be replaced with actual API call
  };

  return (
    <ExpenseForm
      category={category}
      categoryLabel={categoryLabel}
      onSubmit={handleSubmit}
    />
  );
}
