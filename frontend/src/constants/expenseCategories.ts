// Centralized expense category configuration
// This ensures consistent colors, icons, and labels across the entire application

export interface ExpenseCategoryConfig {
  key: string;
  label: string;
  color: string;
  icon: string;
  fields: string[];
}

export const EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  {
    key: 'truck',
    label: 'Truck Repair',
    color: 'blue.6',
    icon: '🚛',
    fields: ['date', 'businessUnit', 'truck', 'repairDescription', 'cost']
  },
  {
    key: 'trailer',
    label: 'Trailer Repair',
    color: 'teal.6',
    icon: '🚚',
    fields: ['date', 'businessUnit', 'trailer', 'repairDescription', 'cost']
  },
  {
    key: 'fuel-diesel',
    label: 'Fuel (Diesel)',
    color: 'cyan.6',
    icon: '⛽',
    fields: ['date', 'fuelStation', 'gallons', 'cost']
  },
  {
    key: 'dmv',
    label: 'DMV',
    color: 'orange.6',
    icon: '📋',
    fields: ['date', 'description', 'cost']
  },
  {
    key: 'parts',
    label: 'Parts',
    color: 'red.6',
    icon: '🔧',
    fields: ['date', 'description', 'cost']
  },
  {
    key: 'phone-tracker',
    label: 'Phone Tracker',
    color: 'violet.6',
    icon: '📱',
    fields: ['date', 'description', 'cost']
  },
  {
    key: 'other-expenses',
    label: 'Other Expenses',
    color: 'gray.7',
    icon: '💼',
    fields: ['date', 'description', 'cost']
  },
  {
    key: 'toll',
    label: 'Toll',
    color: 'lime.7',
    icon: '🛣️',
    fields: ['date', 'cost']
  },
  {
    key: 'office-supplies',
    label: 'Office Supplies',
    color: 'pink.6',
    icon: '📝',
    fields: ['date', 'description', 'cost']
  },
  {
    key: 'def',
    label: 'DEF',
    color: 'indigo.6',
    icon: '🧪',
    fields: ['date', 'cost']
  }
];

// Helper function to get category config by key
export const getCategoryConfig = (key: string): ExpenseCategoryConfig | undefined => {
  return EXPENSE_CATEGORIES.find(cat => cat.key === key);
};

// Helper function to get category label
export const getCategoryLabel = (key: string): string => {
  const config = getCategoryConfig(key);
  return config?.label || key;
};

// Helper function to get category color
export const getCategoryColor = (key: string): string => {
  const config = getCategoryConfig(key);
  return config?.color || 'gray';
};

// Helper function to get category icon
export const getCategoryIcon = (key: string): string => {
  const config = getCategoryConfig(key);
  return config?.icon || '💼';
};

// Create a map for quick lookups
export const CATEGORY_CONFIG_MAP = EXPENSE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.key] = cat;
  return acc;
}, {} as Record<string, ExpenseCategoryConfig>);
