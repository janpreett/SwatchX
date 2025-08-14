import { useParams, useNavigate } from 'react-router-dom';
import { ExpenseForm } from '../components/ExpenseForm';
import { expenseService } from '../services/api';
import { useCompany } from '../hooks/useCompany';

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
  const { selectedCompany } = useCompany();

  if (!category || !(category in categoryLabels)) {
    navigate('/dashboard');
    return null;
  }

  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels];

  const handleSubmit = async (data: ExpenseFormData) => {
    if (!selectedCompany) {
      throw new Error('No company selected');
    }

    // Transform form data to API format
    const expenseData = {
      company: selectedCompany,
      category: category,
      date: data.date?.toISOString() || new Date().toISOString(),
      cost: Number(data.cost),
      description: data.description || undefined,
      repair_description: data.repairDescription || undefined,
      gallons: data.gallons ? Number(data.gallons) : undefined,
      business_unit_id: data.businessUnitId ? Number(data.businessUnitId) : undefined,
      truck_id: data.truckId ? Number(data.truckId) : undefined,
      trailer_id: data.trailerId ? Number(data.trailerId) : undefined,
      fuel_station_id: data.fuelStationId ? Number(data.fuelStationId) : undefined,
    };

    await expenseService.create(expenseData);
  };

  return (
    <ExpenseForm
      category={category}
      categoryLabel={categoryLabel}
      onSubmit={handleSubmit}
    />
  );
}
