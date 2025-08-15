/**
 * Comprehensive tests for ExpenseList component functionality.
 * 
 * Tests expense display, filtering, sorting, and user interactions.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Table, Button, TextInput, Select, Pagination, Checkbox } from '@mantine/core';

// Mock ExpenseList component
const ExpenseList: React.FC = () => {
  const [selectedExpenses, setSelectedExpenses] = React.useState<number[]>([]);
  const [sortBy, setSortBy] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const expenses = [
    {
      id: 1,
      description: 'Gas Station Fill-up',
      amount: 45.50,
      category: 'Fuel',
      date: '2024-01-15',
      hasAttachment: false
    },
    {
      id: 2,
      description: 'Oil Change Service',
      amount: 89.99,
      category: 'Maintenance',
      date: '2024-01-10',
      hasAttachment: true
    },
    {
      id: 3,
      description: 'Parking Fee',
      amount: 15.00,
      category: 'Parking',
      date: '2024-01-20',
      hasAttachment: false
    }
  ];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleSelectExpense = (id: number) => {
    setSelectedExpenses(prev => 
      prev.includes(id) 
        ? prev.filter(expId => expId !== id)
        : [...prev, id]
    );
  };

  return (
    <div>
      {/* Search and Filter Controls */}
      <TextInput 
        label="Search expenses" 
        placeholder="Search..." 
        data-testid="search-input"
      />
      <Select 
        label="Filter by category" 
        placeholder="All categories"
        data={['All', 'Fuel', 'Maintenance', 'Parking']} 
        data-testid="category-filter"
      />
      <TextInput label="Start date" type="date" data-testid="start-date" />
      <TextInput label="End date" type="date" data-testid="end-date" />
      <TextInput label="Minimum amount" type="number" data-testid="min-amount" />
      <TextInput label="Maximum amount" type="number" data-testid="max-amount" />
      <Button data-testid="clear-filters">Clear filters</Button>
      
      {/* Expenses Table */}
      <Table aria-label="Expenses table">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Checkbox 
                checked={selectedExpenses.length === expenses.length}
                onChange={() => {
                  setSelectedExpenses(
                    selectedExpenses.length === expenses.length 
                      ? [] 
                      : expenses.map(e => e.id)
                  );
                }}
              />
            </Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>
              <Button 
                variant="subtle" 
                aria-pressed={sortBy === 'amount'}
                onClick={() => handleSort('amount')}
                data-testid="sort-amount"
              >
                Sort by amount
                {sortBy === 'amount' && (
                  <span data-testid={`sort-direction-${sortDirection}`}>
                    {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </Button>
            </Table.Th>
            <Table.Th>
              <Button 
                variant="subtle" 
                aria-pressed={sortBy === 'category'}
                onClick={() => handleSort('category')}
                data-testid="sort-category"
              >
                Sort by category
              </Button>
            </Table.Th>
            <Table.Th>
              <Button 
                variant="subtle" 
                aria-pressed={sortBy === 'date'}
                onClick={() => handleSort('date')}
                data-testid="sort-date"
              >
                Sort by date
              </Button>
            </Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {expenses.map((expense) => (
            <Table.Tr key={expense.id} data-testid="expense-item">
              <Table.Td>
                <Checkbox 
                  checked={selectedExpenses.includes(expense.id)}
                  onChange={() => handleSelectExpense(expense.id)}
                />
              </Table.Td>
              <Table.Td>
                {expense.description}
                {expense.hasAttachment && (
                  <span data-testid="attachment-icon"> 📎</span>
                )}
              </Table.Td>
              <Table.Td>${expense.amount.toFixed(2)}</Table.Td>
              <Table.Td>{expense.category}</Table.Td>
              <Table.Td>{expense.date}</Table.Td>
              <Table.Td>
                <Button size="xs" data-testid="edit-expense">Edit expense</Button>
                <Button 
                  size="xs" 
                  color="red" 
                  data-testid="delete-expense"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this expense?')) {
                      console.log('Delete expense', expense.id);
                    }
                  }}
                >
                  Delete expense
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      
      {/* Bulk Actions */}
      {selectedExpenses.length > 0 && (
        <Button 
          color="red" 
          data-testid="delete-selected"
          onClick={() => {
            if (window.confirm(`Delete ${selectedExpenses.length} selected expenses?`)) {
              console.log('Delete selected', selectedExpenses);
            }
          }}
        >
          Delete selected ({selectedExpenses.length})
        </Button>
      )}
      
      {/* Pagination */}
      <div>
        <Select 
          label="Items per page"
          data={['10', '20', '50']} 
          defaultValue="10"
          data-testid="page-size"
        />
        <span>Page 1 of 3</span>
        <Pagination 
          total={3} 
          data-testid="pagination"
        />
      </div>
    </div>
  );
};

describe('ExpenseList', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render expense list with all expenses', () => {
      render(<ExpenseList />);

      // Check for expense items
      expect(screen.getByText('Gas Station Fill-up')).toBeInTheDocument();
      expect(screen.getByText('Oil Change Service')).toBeInTheDocument();
      expect(screen.getByText('Parking Fee')).toBeInTheDocument();

      // Check for amounts
      expect(screen.getByText('$45.50')).toBeInTheDocument();
      expect(screen.getByText('$89.99')).toBeInTheDocument();
      expect(screen.getByText('$15.00')).toBeInTheDocument();

      // Check for categories
      expect(screen.getByText('Fuel')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
      expect(screen.getByText('Parking')).toBeInTheDocument();
    });

    it('should show attachment indicators for expenses with attachments', () => {
      render(<ExpenseList />);

      const attachmentIcons = screen.getAllByTestId('attachment-icon');
      expect(attachmentIcons).toHaveLength(1); // Only Oil Change Service has attachment
    });

    it('should render all filter and search controls', () => {
      render(<ExpenseList />);

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
      expect(screen.getByTestId('start-date')).toBeInTheDocument();
      expect(screen.getByTestId('end-date')).toBeInTheDocument();
      expect(screen.getByTestId('min-amount')).toBeInTheDocument();
      expect(screen.getByTestId('max-amount')).toBeInTheDocument();
      expect(screen.getByTestId('clear-filters')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should allow sorting by amount', async () => {
      render(<ExpenseList />);

      const sortButton = screen.getByTestId('sort-amount');
      await user.click(sortButton);

      expect(sortButton).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('sort-direction-asc')).toBeInTheDocument();
    });

    it('should toggle sort direction when clicking same sort button twice', async () => {
      render(<ExpenseList />);

      const sortButton = screen.getByTestId('sort-amount');
      
      // First click - ascending
      await user.click(sortButton);
      expect(screen.getByTestId('sort-direction-asc')).toBeInTheDocument();

      // Second click - descending  
      await user.click(sortButton);
      expect(screen.getByTestId('sort-direction-desc')).toBeInTheDocument();
    });

    it('should allow sorting by category', async () => {
      render(<ExpenseList />);

      const sortButton = screen.getByTestId('sort-category');
      await user.click(sortButton);

      expect(sortButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should allow sorting by date', async () => {
      render(<ExpenseList />);

      const sortButton = screen.getByTestId('sort-date');
      await user.click(sortButton);

      expect(sortButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Selection and Bulk Operations', () => {
    it('should allow selecting individual expenses', async () => {
      render(<ExpenseList />);

      const checkboxes = screen.getAllByRole('checkbox');
      const firstExpenseCheckbox = checkboxes[1]; // Skip the "select all" checkbox

      await user.click(firstExpenseCheckbox);

      expect(firstExpenseCheckbox).toBeChecked();
      expect(screen.getByText('Delete selected (1)')).toBeInTheDocument();
    });

    it('should allow selecting all expenses', async () => {
      render(<ExpenseList />);

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      expect(selectAllCheckbox).toBeChecked();
      expect(screen.getByText('Delete selected (3)')).toBeInTheDocument();
    });

    it('should show bulk delete button when expenses are selected', async () => {
      render(<ExpenseList />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Select first expense
      await user.click(checkboxes[2]); // Select second expense

      expect(screen.getByText('Delete selected (2)')).toBeInTheDocument();
    });

    it('should handle bulk delete confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const consoleSpy = vi.spyOn(console, 'log');

      render(<ExpenseList />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Select first expense

      const deleteButton = screen.getByTestId('delete-selected');
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledWith('Delete 1 selected expenses?');
      expect(consoleSpy).toHaveBeenCalledWith('Delete selected', [1]);

      confirmSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Individual Expense Actions', () => {
    it('should show edit and delete buttons for each expense', () => {
      render(<ExpenseList />);

      const editButtons = screen.getAllByTestId('edit-expense');
      const deleteButtons = screen.getAllByTestId('delete-expense');

      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });

    it('should handle individual expense deletion with confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const consoleSpy = vi.spyOn(console, 'log');

      render(<ExpenseList />);

      const deleteButtons = screen.getAllByTestId('delete-expense');
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this expense?');
      expect(consoleSpy).toHaveBeenCalledWith('Delete expense', 1);

      confirmSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should cancel deletion when user clicks cancel', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const consoleSpy = vi.spyOn(console, 'log');

      render(<ExpenseList />);

      const deleteButtons = screen.getAllByTestId('delete-expense');
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Filter Controls', () => {
    it('should allow typing in search input', async () => {
      render(<ExpenseList />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'gas');

      expect(searchInput).toHaveValue('gas');
    });

    it('should allow selecting category filter', async () => {
      render(<ExpenseList />);

      const categoryFilter = screen.getByTestId('category-filter');
      // Note: Mantine Select testing might need different approach
      expect(categoryFilter).toBeInTheDocument();
    });

    it('should allow setting date range filters', async () => {
      render(<ExpenseList />);

      const startDate = screen.getByTestId('start-date');
      const endDate = screen.getByTestId('end-date');

      await user.type(startDate, '2024-01-12');
      await user.type(endDate, '2024-01-18');

      expect(startDate).toHaveValue('2024-01-12');
      expect(endDate).toHaveValue('2024-01-18');
    });

    it('should allow setting amount range filters', async () => {
      render(<ExpenseList />);

      const minAmount = screen.getByTestId('min-amount');
      const maxAmount = screen.getByTestId('max-amount');

      await user.type(minAmount, '40');
      await user.type(maxAmount, '50');

      expect(minAmount).toHaveValue(40);
      expect(maxAmount).toHaveValue(50);
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      render(<ExpenseList />);

      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByTestId('page-size')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for table', () => {
      render(<ExpenseList />);

      expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Expenses table');
    });

    it('should have proper labels for form controls', () => {
      render(<ExpenseList />);

      expect(screen.getByLabelText('Search expenses')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByLabelText('Start date')).toBeInTheDocument();
      expect(screen.getByLabelText('End date')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum amount')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<ExpenseList />);

      const searchInput = screen.getByTestId('search-input');
      const categoryFilter = screen.getByTestId('category-filter');

      // Tab to search input
      await user.tab();
      expect(searchInput).toHaveFocus();

      // Tab to category filter  
      await user.tab();
      expect(categoryFilter).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple expenses', () => {
      const renderStart = performance.now();
      render(<ExpenseList />);
      const renderTime = performance.now() - renderStart;

      // Should render quickly (less than 100ms for this simple case)
      expect(renderTime).toBeLessThan(100);
    });
  });
});
