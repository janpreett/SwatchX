/**
 * End-to-End Tests for SwatchX Fleet Expense Tracking Application
 * 
 * Tests complete user flows including authentication, expense management,
 * and management entity operations.
 */
import { test, expect } from '@playwright/test';

test.describe('SwatchX E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test.describe('Authentication Flow', () => {
    
    test('should allow user to sign up with valid credentials', async ({ page }) => {
      // Navigate to signup page
      await page.click('text=Sign Up');
      
      // Fill signup form
      await page.fill('[data-testid="signup-name"]', 'Test User');
      await page.fill('[data-testid="signup-email"]', 'test@example.com');
      await page.fill('[data-testid="signup-password"]', 'SecurePassword123!');
      await page.fill('[data-testid="signup-confirm-password"]', 'SecurePassword123!');
      
      // Submit form
      await page.click('[data-testid="signup-submit"]');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=Welcome, Test User')).toBeVisible();
    });

    test('should allow user to login with valid credentials', async ({ page }) => {
      // Navigate to login page
      await page.click('text=Sign In');
      
      // Fill login form
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      
      // Submit form
      await page.click('[data-testid="login-submit"]');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=Welcome back')).toBeVisible();
    });

    test('should display error for invalid login credentials', async ({ page }) => {
      await page.click('text=Sign In');
      
      await page.fill('[data-testid="login-email"]', 'wrong@example.com');
      await page.fill('[data-testid="login-password"]', 'wrongpassword');
      
      await page.click('[data-testid="login-submit"]');
      
      // Should display error message
      await expect(page.locator('text=Invalid email or password')).toBeVisible();
    });

    test('should validate signup form fields', async ({ page }) => {
      await page.click('text=Sign Up');
      
      // Try to submit empty form
      await page.click('[data-testid="signup-submit"]');
      
      // Should display validation errors
      await expect(page.locator('text=Name is required')).toBeVisible();
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.click('text=Sign In');
      
      await page.fill('[data-testid="login-email"]', 'invalid-email');
      await page.click('[data-testid="login-submit"]');
      
      await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });

    test('should validate password strength during signup', async ({ page }) => {
      await page.click('text=Sign Up');
      
      await page.fill('[data-testid="signup-name"]', 'Test User');
      await page.fill('[data-testid="signup-email"]', 'test@example.com');
      await page.fill('[data-testid="signup-password"]', '123');
      
      await page.click('[data-testid="signup-submit"]');
      
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });

    test('should logout user successfully', async ({ page }) => {
      // Login first
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Logout');
      
      // Should redirect to home page
      await expect(page).toHaveURL('/');
      await expect(page.locator('text=Sign In')).toBeVisible();
    });
  });

  test.describe('Dashboard and Navigation', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
    });

    test('should display dashboard with key metrics', async ({ page }) => {
      await expect(page.locator('[data-testid="total-expenses"]')).toBeVisible();
      await expect(page.locator('[data-testid="this-month-expenses"]')).toBeVisible();
      await expect(page.locator('[data-testid="expense-categories"]')).toBeVisible();
      await expect(page.locator('[data-testid="recent-expenses"]')).toBeVisible();
    });

    test('should navigate between main sections', async ({ page }) => {
      // Navigate to Expenses
      await page.click('text=Expenses');
      await expect(page).toHaveURL('/expenses');
      await expect(page.locator('text=Expense Management')).toBeVisible();

      // Navigate to Management
      await page.click('text=Management');
      await expect(page).toHaveURL('/management');
      await expect(page.locator('text=Fleet Management')).toBeVisible();

      // Navigate back to Dashboard
      await page.click('text=Dashboard');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should display responsive navigation on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check for mobile menu button
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      
      // Check navigation items are visible
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Expenses')).toBeVisible();
      await expect(page.locator('text=Management')).toBeVisible();
    });
  });

  test.describe('Expense Management', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login and navigate to expenses
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.click('text=Expenses');
    });

    test('should create a new expense', async ({ page }) => {
      // Click create expense button
      await page.click('[data-testid="create-expense-button"]');
      
      // Fill expense form
      await page.fill('[data-testid="expense-description"]', 'Gas Station Fill-up');
      await page.fill('[data-testid="expense-amount"]', '45.50');
      await page.selectOption('[data-testid="expense-category"]', 'Fuel');
      await page.fill('[data-testid="expense-date"]', '2024-01-15');
      await page.selectOption('[data-testid="expense-vehicle"]', 'Vehicle 1');
      
      // Submit form
      await page.click('[data-testid="expense-submit"]');
      
      // Should show success message and new expense in list
      await expect(page.locator('text=Expense created successfully')).toBeVisible();
      await expect(page.locator('text=Gas Station Fill-up')).toBeVisible();
      await expect(page.locator('text=$45.50')).toBeVisible();
    });

    test('should upload receipt attachment with expense', async ({ page }) => {
      await page.click('[data-testid="create-expense-button"]');
      
      // Fill basic expense info
      await page.fill('[data-testid="expense-description"]', 'Oil Change with Receipt');
      await page.fill('[data-testid="expense-amount"]', '89.99');
      await page.selectOption('[data-testid="expense-category"]', 'Maintenance');
      await page.fill('[data-testid="expense-date"]', '2024-01-10');
      
      // Upload receipt
      const fileInput = page.locator('[data-testid="expense-attachment"]');
      await fileInput.setInputFiles({
        name: 'receipt.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      });
      
      await page.click('[data-testid="expense-submit"]');
      
      // Should show attachment icon in expense list
      await expect(page.locator('[data-testid="attachment-icon"]')).toBeVisible();
    });

    test('should edit existing expense', async ({ page }) => {
      // Assume expense exists, click edit button
      await page.click('[data-testid="expense-edit-1"]');
      
      // Modify expense details
      await page.fill('[data-testid="expense-description"]', 'Updated Gas Station Fill-up');
      await page.fill('[data-testid="expense-amount"]', '47.50');
      
      await page.click('[data-testid="expense-update"]');
      
      // Should show updated expense
      await expect(page.locator('text=Expense updated successfully')).toBeVisible();
      await expect(page.locator('text=Updated Gas Station Fill-up')).toBeVisible();
      await expect(page.locator('text=$47.50')).toBeVisible();
    });

    test('should delete expense with confirmation', async ({ page }) => {
      // Click delete button for first expense
      await page.click('[data-testid="expense-delete-1"]');
      
      // Should show confirmation dialog
      await expect(page.locator('text=Confirm Delete')).toBeVisible();
      await expect(page.locator('text=Are you sure you want to delete this expense?')).toBeVisible();
      
      // Cancel deletion
      await page.click('text=Cancel');
      await expect(page.locator('text=Confirm Delete')).not.toBeVisible();
      
      // Try delete again and confirm
      await page.click('[data-testid="expense-delete-1"]');
      await page.click('text=Delete');
      
      await expect(page.locator('text=Expense deleted successfully')).toBeVisible();
    });

    test('should filter expenses by category', async ({ page }) => {
      // Select category filter
      await page.selectOption('[data-testid="category-filter"]', 'Fuel');
      
      // Should show only fuel expenses
      await expect(page.locator('text=Gas Station Fill-up')).toBeVisible();
      await expect(page.locator('text=Oil Change Service')).not.toBeVisible();
      
      // Clear filter
      await page.selectOption('[data-testid="category-filter"]', 'All');
      await expect(page.locator('text=Oil Change Service')).toBeVisible();
    });

    test('should search expenses by description', async ({ page }) => {
      // Type in search box
      await page.fill('[data-testid="expense-search"]', 'gas');
      
      // Should filter results
      await expect(page.locator('text=Gas Station Fill-up')).toBeVisible();
      await expect(page.locator('text=Oil Change Service')).not.toBeVisible();
      
      // Clear search
      await page.fill('[data-testid="expense-search"]', '');
      await expect(page.locator('text=Oil Change Service')).toBeVisible();
    });

    test('should sort expenses by amount', async ({ page }) => {
      // Click sort by amount button
      await page.click('[data-testid="sort-amount"]');
      
      // Check sorting indicator
      await expect(page.locator('[data-testid="sort-direction-asc"]')).toBeVisible();
      
      // Click again to reverse sort
      await page.click('[data-testid="sort-amount"]');
      await expect(page.locator('[data-testid="sort-direction-desc"]')).toBeVisible();
    });

    test('should paginate through large expense lists', async ({ page }) => {
      // Should show pagination if more than page size
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      
      // Click next page
      await page.click('[data-testid="next-page"]');
      await expect(page.locator('text=Page 2 of')).toBeVisible();
      
      // Click previous page
      await page.click('[data-testid="prev-page"]');
      await expect(page.locator('text=Page 1 of')).toBeVisible();
    });

    test('should handle bulk operations', async ({ page }) => {
      // Select multiple expenses
      await page.check('[data-testid="expense-select-1"]');
      await page.check('[data-testid="expense-select-2"]');
      
      // Should show bulk actions
      await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
      await expect(page.locator('text=2 items selected')).toBeVisible();
      
      // Click bulk delete
      await page.click('[data-testid="bulk-delete"]');
      await page.click('text=Delete Selected');
      
      await expect(page.locator('text=2 expenses deleted successfully')).toBeVisible();
    });
  });

  test.describe('Management Entities', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login and navigate to management
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.click('text=Management');
    });

    test('should create a new vehicle', async ({ page }) => {
      await page.click('text=Vehicles');
      await page.click('[data-testid="create-vehicle-button"]');
      
      await page.fill('[data-testid="vehicle-name"]', 'Fleet Vehicle 01');
      await page.fill('[data-testid="vehicle-make"]', 'Toyota');
      await page.fill('[data-testid="vehicle-model"]', 'Camry');
      await page.fill('[data-testid="vehicle-year"]', '2022');
      await page.fill('[data-testid="vehicle-license"]', 'ABC-123');
      
      await page.click('[data-testid="vehicle-submit"]');
      
      await expect(page.locator('text=Vehicle created successfully')).toBeVisible();
      await expect(page.locator('text=Fleet Vehicle 01')).toBeVisible();
    });

    test('should create a new driver', async ({ page }) => {
      await page.click('text=Drivers');
      await page.click('[data-testid="create-driver-button"]');
      
      await page.fill('[data-testid="driver-name"]', 'John Driver');
      await page.fill('[data-testid="driver-license"]', 'D123456789');
      await page.fill('[data-testid="driver-phone"]', '555-0123');
      await page.fill('[data-testid="driver-email"]', 'john@example.com');
      
      await page.click('[data-testid="driver-submit"]');
      
      await expect(page.locator('text=Driver created successfully')).toBeVisible();
      await expect(page.locator('text=John Driver')).toBeVisible();
    });

    test('should create a new vendor', async ({ page }) => {
      await page.click('text=Vendors');
      await page.click('[data-testid="create-vendor-button"]');
      
      await page.fill('[data-testid="vendor-name"]', 'Shell Gas Station');
      await page.fill('[data-testid="vendor-contact"]', 'Manager');
      await page.fill('[data-testid="vendor-phone"]', '555-0456');
      await page.fill('[data-testid="vendor-address"]', '123 Main St, City, State 12345');
      
      await page.click('[data-testid="vendor-submit"]');
      
      await expect(page.locator('text=Vendor created successfully')).toBeVisible();
      await expect(page.locator('text=Shell Gas Station')).toBeVisible();
    });

    test('should edit management entities', async ({ page }) => {
      await page.click('text=Vehicles');
      await page.click('[data-testid="vehicle-edit-1"]');
      
      await page.fill('[data-testid="vehicle-name"]', 'Updated Fleet Vehicle 01');
      await page.click('[data-testid="vehicle-update"]');
      
      await expect(page.locator('text=Vehicle updated successfully')).toBeVisible();
      await expect(page.locator('text=Updated Fleet Vehicle 01')).toBeVisible();
    });

    test('should validate management entity forms', async ({ page }) => {
      await page.click('text=Vehicles');
      await page.click('[data-testid="create-vehicle-button"]');
      
      // Try to submit empty form
      await page.click('[data-testid="vehicle-submit"]');
      
      await expect(page.locator('text=Name is required')).toBeVisible();
      await expect(page.locator('text=Make is required')).toBeVisible();
      await expect(page.locator('text=Model is required')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      
      // Should show network error message
      await expect(page.locator('text=Network error')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should handle server errors with proper messaging', async ({ page }) => {
      // Mock server error response
      await page.route('**/api/auth/login', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' })
        });
      });
      
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      
      await expect(page.locator('text=Internal server error')).toBeVisible();
    });

    test('should show loading states during operations', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/auth/login', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            token: 'mock-token', 
            user: { id: 1, name: 'Test User', email: 'test@example.com' }
          })
        });
      });
      
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      
      // Should show loading state
      await expect(page.locator('text=Signing in...')).toBeVisible();
      await expect(page.locator('[data-testid="login-submit"]')).toBeDisabled();
    });
  });

  test.describe('Accessibility', () => {
    
    test('should be navigable with keyboard only', async ({ page }) => {
      await page.keyboard.press('Tab');
      await expect(page.locator('text=Sign In')).toBeFocused();
      
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL('/login');
      
      // Tab through form fields
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-email"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-password"]')).toBeFocused();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Check for proper ARIA attributes
      const emailInput = page.locator('[data-testid="login-email"]');
      await expect(emailInput).toHaveAttribute('aria-label', /email/i);
      
      const passwordInput = page.locator('[data-testid="login-password"]');
      await expect(passwordInput).toHaveAttribute('aria-label', /password/i);
      
      const submitButton = page.locator('[data-testid="login-submit"]');
      await expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('should announce form errors to screen readers', async ({ page }) => {
      await page.click('text=Sign In');
      await page.click('[data-testid="login-submit"]');
      
      // Error messages should have proper ARIA attributes
      const errorMessage = page.locator('text=Email is required');
      await expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  test.describe('Performance', () => {
    
    test('should load pages within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 second limit
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      // Mock large dataset
      await page.route('**/api/expenses', route => {
        const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          description: `Expense ${i + 1}`,
          amount: (i + 1) * 10,
          category: 'Fuel',
          date: '2024-01-15'
        }));
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: largeDataset, total: 1000 })
        });
      });
      
      // Login and navigate to expenses
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.click('text=Expenses');
      
      // Should render pagination instead of all items
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      
      // Should not have all 1000 items in DOM
      const expenseItems = page.locator('[data-testid="expense-item"]');
      const count = await expenseItems.count();
      expect(count).toBeLessThan(100);
    });
  });

  test.describe('Data Validation and Edge Cases', () => {
    
    test('should handle special characters in expense descriptions', async ({ page }) => {
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.click('text=Expenses');
      
      await page.click('[data-testid="create-expense-button"]');
      await page.fill('[data-testid="expense-description"]', 'Café & Restaurant Bill (João\'s)');
      await page.fill('[data-testid="expense-amount"]', '25.99');
      await page.selectOption('[data-testid="expense-category"]', 'Meals');
      await page.fill('[data-testid="expense-date"]', '2024-01-15');
      
      await page.click('[data-testid="expense-submit"]');
      
      await expect(page.locator('text=Café & Restaurant Bill (João\'s)')).toBeVisible();
    });

    test('should validate maximum file size for attachments', async ({ page }) => {
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.click('text=Expenses');
      
      await page.click('[data-testid="create-expense-button"]');
      
      // Try to upload a large file (simulate)
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 'a'); // 10MB file
      await page.locator('[data-testid="expense-attachment"]').setInputFiles({
        name: 'large-file.jpg',
        mimeType: 'image/jpeg',
        buffer: largeBuffer
      });
      
      await expect(page.locator('text=File size must be less than 5MB')).toBeVisible();
    });

    test('should handle concurrent user operations', async ({ page, context }) => {
      // Open multiple tabs
      const page2 = await context.newPage();
      
      // Login on both tabs
      await page.click('text=Sign In');
      await page.fill('[data-testid="login-email"]', 'test@example.com');
      await page.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page.click('[data-testid="login-submit"]');
      
      await page2.goto('/');
      await page2.click('text=Sign In');
      await page2.fill('[data-testid="login-email"]', 'test@example.com');
      await page2.fill('[data-testid="login-password"]', 'SecurePassword123!');
      await page2.click('[data-testid="login-submit"]');
      
      // Navigate both to expenses
      await page.click('text=Expenses');
      await page2.click('text=Expenses');
      
      // Create expense on page 1
      await page.click('[data-testid="create-expense-button"]');
      await page.fill('[data-testid="expense-description"]', 'Concurrent Test 1');
      await page.fill('[data-testid="expense-amount"]', '50.00');
      await page.selectOption('[data-testid="expense-category"]', 'Fuel');
      await page.click('[data-testid="expense-submit"]');
      
      // Create expense on page 2
      await page2.click('[data-testid="create-expense-button"]');
      await page2.fill('[data-testid="expense-description"]', 'Concurrent Test 2');
      await page2.fill('[data-testid="expense-amount"]', '75.00');
      await page2.selectOption('[data-testid="expense-category"]', 'Maintenance');
      await page2.click('[data-testid="expense-submit"]');
      
      // Both expenses should be visible on both pages
      await page.reload();
      await expect(page.locator('text=Concurrent Test 1')).toBeVisible();
      await expect(page.locator('text=Concurrent Test 2')).toBeVisible();
    });
  });
});
