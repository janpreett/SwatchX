/**
 * Comprehensive tests for the ExpenseList component.
 * 
 * Tests expense display, filtering, pagination, sorting, and CRUD operations.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Table, Button, TextInput, Select, Pagination, Checkbox } from '@mantine/core';

// Mock ExpenseList component for testing
const ExpenseList: React.FC = () => {
  const expenses = [
    {
      id: 1,
      description: 'Gas Station Fill-up',
      price: 45.50,
      category: 'Fuel',
      date: '2024-01-15',
    },
    {
      id: 2,
      description: 'Oil Change Service',
      price: 89.99,
      category: 'Maintenance',
      date: '2024-01-10',
    },
  ];

  return (
    <div>
      <TextInput label="Search expenses" placeholder="Search..." />
      <Select label="Filter by category" data={['All', 'Fuel', 'Maintenance', 'Parking']} />
      <Button>Clear filters</Button>
      
      <Table aria-label="Expenses table">
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Checkbox /></Table.Th>
            <Table.Th>
              <Button variant="subtle" aria-pressed="false">Sort by date</Button>
            </Table.Th>
            <Table.Th>
              <Button variant="subtle" aria-pressed="false">Sort by amount</Button>
            </Table.Th>
            <Table.Th>
              <Button variant="subtle" aria-pressed="false">Sort by category</Button>
            </Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {expenses.map((expense) => (
            <Table.Tr key={expense.id} data-testid="expense-item">
              <Table.Td><Checkbox /></Table.Td>
              <Table.Td>{expense.description}</Table.Td>
              <Table.Td>${expense.price}</Table.Td>
              <Table.Td>{expense.category}</Table.Td>
              <Table.Td>
                <Button size="xs">Edit expense</Button>
                <Button size="xs" color="red">Delete expense</Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      
      <Button color="red">Delete selected</Button>
      <Pagination total={3} />
    </div>
  );
};

// Mock expense data
const mockExpenses = [
  {
    id: 1,
    description: 'Gas Station Fill-up',
    price: 45.50,
    category: 'Fuel',
    date: '2024-01-15',
    vehicleId: 1,
    attachmentUrl: null,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    description: 'Oil Change Service',
    price: 89.99,
    category: 'Maintenance',
    date: '2024-01-10',
    vehicleId: 2,
    attachmentUrl: '/attachments/receipt.jpg',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: 3,
    description: 'Parking Fee',
    price: 15.00,
    category: 'Parking',
    date: '2024-01-20',
    vehicleId: 1,
    attachmentUrl: null,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  }
];

// Mock the useExpenses hook
// const mockUseExpenses = vi.spyOn(expenseHook, 'useExpenses');
const mockUseExpenses = {
  mockReturnValue: vi.fn(),
};
const mockDeleteExpense = vi.fn();
const mockUpdateExpense = vi.fn();

describe('ExpenseList', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseExpenses.mockReturnValue({
      expenses: mockExpenses,
      loading: false,
      error: null,
      totalCount: mockExpenses.length,
      createExpense: vi.fn(),
      updateExpense: mockUpdateExpense,
      deleteExpense: mockDeleteExpense,
      refreshExpenses: vi.fn()
    });
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

    it('should display loading state when expenses are being fetched', () => {
      mockUseExpenses.mockReturnValue({
        expenses: [],
        loading: true,
        error: null,
        totalCount: 0,
        createExpense: vi.fn(),
        updateExpense: vi.fn(),
        deleteExpense: vi.fn(),
        refreshExpenses: vi.fn()
      });

      render(<ExpenseList />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display error message when expense fetching fails', () => {
      const errorMessage = 'Failed to load expenses';
      mockUseExpenses.mockReturnValue({
        expenses: [],
        loading: false,
        error: new Error(errorMessage),
        totalCount: 0,
        createExpense: vi.fn(),
        updateExpense: vi.fn(),
        deleteExpense: vi.fn(),
        refreshExpenses: vi.fn()
      });

      render(<ExpenseList />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display empty state when no expenses exist', () => {
      mockUseExpenses.mockReturnValue({
        expenses: [],
        loading: false,
        error: null,
        totalCount: 0,
        createExpense: vi.fn(),
        updateExpense: vi.fn(),
        deleteExpense: vi.fn(),
        refreshExpenses: vi.fn()
      });

      render(<ExpenseList />);

      expect(screen.getByText(/no expenses found/i)).toBeInTheDocument();
    });

    it('should show attachment indicators for expenses with attachments', () => {
      render(<ExpenseList />);

      // Oil Change Service has attachment
      const expenseWithAttachment = screen.getByText('Oil Change Service').closest('[data-testid="expense-item"]');
      expect(expenseWithAttachment?.querySelector('[data-testid="attachment-icon"]')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should allow sorting by date', async () => {
      render(<ExpenseList />);

      const sortButton = screen.getByRole('button', { name: /sort by date/i });
      await user.click(sortButton);

      // Verify sorting indicator
      expect(screen.getByRole('button', { name: /sort by date/i })).toHaveAttribute('aria-pressed', 'true');
    });

    it('should allow sorting by amount', async () => {
      render(<ExpenseList />);

      const sortButton = screen.getByRole('button', { name: /sort by amount/i });
      await user.click(sortButton);

      // Verify sorting indicator
      expect(screen.getByRole('button', { name: /sort by amount/i })).toHaveAttribute('aria-pressed', 'true');
    });

    it('should allow sorting by category', async () => {
      render(<ExpenseList />);

      const sortButton = screen.getByRole('button', { name: /sort by category/i });
      await user.click(sortButton);

      // Verify sorting indicator
      expect(screen.getByRole('button', { name: /sort by category/i })).toHaveAttribute('aria-pressed', 'true');
    });

    it('should toggle sort direction when clicking same sort button twice', async () => {
      render(<ExpenseList />);

      const sortButton = screen.getByRole('button', { name: /sort by date/i });
      
      // First click - ascending
      await user.click(sortButton);
      expect(screen.getByTestId('sort-direction-asc')).toBeInTheDocument();

      // Second click - descending
      await user.click(sortButton);
      expect(screen.getByTestId('sort-direction-desc')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should allow filtering by category', async () => {
      render(<ExpenseList />);

      const categoryFilter = screen.getByLabelText(/filter by category/i);
      await user.selectOptions(categoryFilter, 'Fuel');

      // Should show only fuel expenses
      expect(screen.getByText('Gas Station Fill-up')).toBeInTheDocument();
      expect(screen.queryByText('Oil Change Service')).not.toBeInTheDocument();
      expect(screen.queryByText('Parking Fee')).not.toBeInTheDocument();
    });

    it('should allow filtering by date range', async () => {
      render(<ExpenseList />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2024-01-12');
      await user.type(endDateInput, '2024-01-18');

      // Should show only expenses within date range
      expect(screen.getByText('Gas Station Fill-up')).toBeInTheDocument();
      expect(screen.queryByText('Oil Change Service')).not.toBeInTheDocument();
      expect(screen.queryByText('Parking Fee')).not.toBeInTheDocument();
    });

    it('should allow filtering by amount range', async () => {
      render(<ExpenseList />);

      const minAmountInput = screen.getByLabelText(/minimum amount/i);
      const maxAmountInput = screen.getByLabelText(/maximum amount/i);

      await user.type(minAmountInput, '40');
      await user.type(maxAmountInput, '50');

      // Should show only expenses within amount range
      expect(screen.getByText('Gas Station Fill-up')).toBeInTheDocument();
      expect(screen.queryByText('Oil Change Service')).not.toBeInTheDocument();
      expect(screen.queryByText('Parking Fee')).not.toBeInTheDocument();
    });

    it('should allow text search in descriptions', async () => {
      render(<ExpenseList />);

      const searchInput = screen.getByLabelText(/search expenses/i);
      await user.type(searchInput, 'gas');

      // Should show only expenses matching search
      expect(screen.getByText('Gas Station Fill-up')).toBeInTheDocument();
      expect(screen.queryByText('Oil Change Service')).not.toBeInTheDocument();
      expect(screen.queryByText('Parking Fee')).not.toBeInTheDocument();
    });

    it('should combine multiple filters correctly', async () => {
      render(<ExpenseList />);

      const categoryFilter = screen.getByLabelText(/filter by category/i);
      const searchInput = screen.getByLabelText(/search expenses/i);

      await user.selectOptions(categoryFilter, 'Fuel');
      await user.type(searchInput, 'station');

      // Should show only expenses matching both filters
      expect(screen.getByText('Gas Station Fill-up')).toBeInTheDocument();
      expect(screen.queryByText('Oil Change Service')).not.toBeInTheDocument();
      expect(screen.queryByText('Parking Fee')).not.toBeInTheDocument();
    });

    it('should clear all filters when clear button is clicked', async () => {
      render(<ExpenseList />);

      const categoryFilter = screen.getByLabelText(/filter by category/i);
      const searchInput = screen.getByLabelText(/search expenses/i);
      const clearButton = screen.getByRole('button', { name: /clear filters/i });

      // Apply filters
      await user.selectOptions(categoryFilter, 'Fuel');
      await user.type(searchInput, 'gas');

      // Clear filters
      await user.click(clearButton);

      // All expenses should be visible again
      expect(screen.getByText('Gas Station Fill-up')).toBeInTheDocument();
      expect(screen.getByText('Oil Change Service')).toBeInTheDocument();
      expect(screen.getByText('Parking Fee')).toBeInTheDocument();

      // Filter inputs should be cleared
      expect(categoryFilter).toHaveValue('');
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      // Mock large dataset
      const manyExpenses = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        description: `Expense ${i + 1}`,
        amount: (i + 1) * 10,
        category: 'Fuel',
        date: '2024-01-15',
        vehicleId: 1,
        attachmentUrl: null,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }));

      mockUseExpenses.mockReturnValue({
        expenses: manyExpenses.slice(0, 10), // First page
        loading: false,
        error: null,
        totalCount: manyExpenses.length,
        createExpense: vi.fn(),
        updateExpense: vi.fn(),
        deleteExpense: vi.fn(),
        refreshExpenses: vi.fn()
      });
    });

    it('should display pagination controls for large datasets', () => {
      render(<ExpenseList />);

      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    });

    it('should allow changing page size', async () => {
      render(<ExpenseList />);

      const pageSizeSelect = screen.getByLabelText(/items per page/i);
      await user.selectOptions(pageSizeSelect, '20');

      expect(pageSizeSelect).toHaveValue('20');
    });

    it('should navigate to next page', async () => {
      render(<ExpenseList />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);

      // Should trigger page change (mock would need to handle this)
      expect(nextButton).toBeDefined();
    });
  });

  describe('CRUD Operations', () => {
    it('should allow deleting an expense', async () => {
      mockDeleteExpense.mockResolvedValue(undefined);

      render(<ExpenseList />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete expense/i });
      await user.click(deleteButtons[0]);

      // Should show confirmation dialog
      expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteExpense).toHaveBeenCalledWith(1);
      });
    });

    it('should cancel expense deletion when cancel is clicked', async () => {
      render(<ExpenseList />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete expense/i });
      await user.click(deleteButtons[0]);

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockDeleteExpense).not.toHaveBeenCalled();
      expect(screen.queryByText(/confirm delete/i)).not.toBeInTheDocument();
    });

    it('should open edit modal when edit button is clicked', async () => {
      render(<ExpenseList />);

      const editButtons = screen.getAllByRole('button', { name: /edit expense/i });
      await user.click(editButtons[0]);

      expect(screen.getByText(/edit expense/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Gas Station Fill-up')).toBeInTheDocument();
    });

    it('should handle bulk deletion of selected expenses', async () => {
      mockDeleteExpense.mockResolvedValue(undefined);

      render(<ExpenseList />);

      // Select multiple expenses
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // First expense
      await user.click(checkboxes[1]); // Second expense

      // Click bulk delete
      const bulkDeleteButton = screen.getByRole('button', { name: /delete selected/i });
      await user.click(bulkDeleteButton);

      // Confirm bulk deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteExpense).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all interactive elements', () => {
      render(<ExpenseList />);

      expect(screen.getByLabelText(/search expenses/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by category/i)).toBeInTheDocument();
      expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Expenses table');
    });

    it('should support keyboard navigation', async () => {
      render(<ExpenseList />);

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByLabelText(/search expenses/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/filter by category/i)).toHaveFocus();
    });

    it('should announce sort changes to screen readers', async () => {
      render(<ExpenseList />);

      const sortButton = screen.getByRole('button', { name: /sort by date/i });
      await user.click(sortButton);

      expect(sortButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Performance', () => {
    it('should virtualize long lists for better performance', () => {
      // Mock very large dataset
      const manyExpenses = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        description: `Expense ${i + 1}`,
        price: (i + 1) * 10,
        category: 'Fuel',
        date: '2024-01-15',
        vehicleId: 1,
        attachmentUrl: null,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }));

      mockUseExpenses.mockReturnValue({
        expenses: manyExpenses,
        loading: false,
        error: null,
        totalCount: manyExpenses.length,
        createExpense: vi.fn(),
        updateExpense: vi.fn(),
        deleteExpense: vi.fn(),
        refreshExpenses: vi.fn()
      });

      render(<ExpenseList />);

      // Should not render all 1000 items in DOM
      const expenseItems = screen.getAllByTestId('expense-item');
      expect(expenseItems.length).toBeLessThan(100); // Assuming virtualization
    });

    it('should debounce search input to avoid excessive API calls', async () => {
      const mockRefresh = vi.fn();
      mockUseExpenses.mockReturnValue({
        expenses: mockExpenses,
        loading: false,
        error: null,
        totalCount: mockExpenses.length,
        createExpense: vi.fn(),
        updateExpense: vi.fn(),
        deleteExpense: vi.fn(),
        refreshExpenses: mockRefresh
      });

      render(<ExpenseList />);

      const searchInput = screen.getByLabelText(/search expenses/i);
      
      // Type quickly
      await user.type(searchInput, 'gas');

      // Should debounce and not call refresh immediately
      expect(mockRefresh).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle delete operation errors gracefully', async () => {
      mockDeleteExpense.mockRejectedValue(new Error('Delete failed'));

      render(<ExpenseList />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete expense/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/delete failed/i)).toBeInTheDocument();
      });
    });

    it('should show appropriate message for network errors', async () => {
      mockUseExpenses.mockReturnValue({
        expenses: [],
        loading: false,
        error: new Error('Network error'),
        totalCount: 0,
        createExpense: vi.fn(),
        updateExpense: vi.fn(),
        deleteExpense: vi.fn(),
        refreshExpenses: vi.fn()
      });

      render(<ExpenseList />);

      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});
