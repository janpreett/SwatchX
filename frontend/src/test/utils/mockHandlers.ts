/**
 * Mock Service Worker (MSW) handlers for API mocking in tests.
 * 
 * Provides mock responses for all API endpoints to enable isolated testing
 * without depending on the actual backend server.
 */
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Mock data
const mockUser = {
  id: 1,
  email: 'test@example.com',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  has_security_questions: false,
};

const mockBusinessUnits = [
  { id: 1, name: 'Main Operations' },
  { id: 2, name: 'Secondary Operations' },
];

const mockTrucks = [
  { id: 1, number: 'TRK-001' },
  { id: 2, number: 'TRK-002' },
];

const mockTrailers = [
  { id: 1, number: 'TRL-001' },
  { id: 2, number: 'TRL-002' },
];

const mockFuelStations = [
  { id: 1, name: 'Shell Downtown' },
  { id: 2, name: 'Petro Canada Highway' },
];

const mockExpenses = [
  {
    id: 1,
    date: '2024-01-15',
    amount: 125.50,
    description: 'Fuel for delivery',
    category: 'fuel',
    company: 'swatchx',
    business_unit_id: 1,
    truck_id: 1,
    trailer_id: 1,
    fuel_station_id: 1,
    fuel_quantity: 45.5,
    attachment_path: null,
    created_at: '2024-01-15T10:00:00Z',
    business_unit: { id: 1, name: 'Main Operations' },
    truck: { id: 1, number: 'TRK-001' },
    trailer: { id: 1, number: 'TRL-001' },
    fuel_station: { id: 1, name: 'Shell Downtown' },
  },
  {
    id: 2,
    date: '2024-01-16',
    amount: 85.25,
    description: 'Maintenance repair',
    category: 'maintenance',
    company: 'swatchx',
    business_unit_id: 2,
    truck_id: 2,
    trailer_id: null,
    fuel_station_id: null,
    fuel_quantity: null,
    attachment_path: 'attachments/receipt_2.pdf',
    created_at: '2024-01-16T14:30:00Z',
    business_unit: { id: 2, name: 'Secondary Operations' },
    truck: { id: 2, number: 'TRK-002' },
    trailer: null,
    fuel_station: null,
  },
];

export const handlers = [
  // Authentication endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Mock authentication logic
    if (username === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: mockUser,
      });
    }

    if (username === 'invalid@example.com') {
      return HttpResponse.json(
        { detail: 'Incorrect email or password' },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      { detail: 'Incorrect email or password' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/signup`, async ({ request }) => {
    const data = await request.json() as { email?: string; password?: string; confirm_password?: string };
    
    // Mock signup validation
    if (data?.email === 'existing@example.com') {
      return HttpResponse.json(
        { detail: 'Email already registered' },
        { status: 400 }
      );
    }

    if (!data?.password || data.password.length < 8) {
      return HttpResponse.json(
        { detail: 'Password too short' },
        { status: 422 }
      );
    }

    return HttpResponse.json({
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      user: {
        ...mockUser,
        email: data.email,
      },
    }, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  // Expense endpoints
  http.get(`${API_BASE_URL}/api/v1/expenses/`, ({ request }) => {
    const url = new URL(request.url);
    const company = url.searchParams.get('company');
    const category = url.searchParams.get('category');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    let filteredExpenses = [...mockExpenses];

    if (company) {
      filteredExpenses = filteredExpenses.filter(exp => exp.company === company);
    }

    if (category) {
      filteredExpenses = filteredExpenses.filter(exp => exp.category === category);
    }

    // Apply pagination
    const paginatedExpenses = filteredExpenses.slice(skip, skip + limit);

    return HttpResponse.json(paginatedExpenses);
  }),

  http.get(`${API_BASE_URL}/api/v1/expenses/:id`, ({ params }) => {
    const expenseId = parseInt(params.id as string);
    const expense = mockExpenses.find(exp => exp.id === expenseId);

    if (!expense) {
      return HttpResponse.json(
        { detail: 'Expense not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(expense);
  }),

  http.post(`${API_BASE_URL}/api/v1/expenses/`, async ({ request }) => {
    const formData = await request.formData();
    const expenseData = JSON.parse(formData.get('expense_data') as string);
    
    // Mock validation
    if (!expenseData.date || !expenseData.amount) {
      return HttpResponse.json(
        { detail: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newExpense = {
      id: mockExpenses.length + 1,
      ...expenseData,
      created_at: new Date().toISOString(),
      attachment_path: formData.get('attachment') ? 'attachments/mock_file.pdf' : null,
      business_unit: expenseData.business_unit_id ? mockBusinessUnits.find(bu => bu.id === expenseData.business_unit_id) : null,
      truck: expenseData.truck_id ? mockTrucks.find(t => t.id === expenseData.truck_id) : null,
      trailer: expenseData.trailer_id ? mockTrailers.find(t => t.id === expenseData.trailer_id) : null,
      fuel_station: expenseData.fuel_station_id ? mockFuelStations.find(fs => fs.id === expenseData.fuel_station_id) : null,
    };

    mockExpenses.push(newExpense);
    return HttpResponse.json(newExpense, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/api/v1/expenses/:id`, async ({ params, request }) => {
    const expenseId = parseInt(params.id as string);
    const expenseIndex = mockExpenses.findIndex(exp => exp.id === expenseId);

    if (expenseIndex === -1) {
      return HttpResponse.json(
        { detail: 'Expense not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const updateData = JSON.parse(formData.get('expense_data') as string);

    // Update the mock expense
    mockExpenses[expenseIndex] = {
      ...mockExpenses[expenseIndex],
      ...updateData,
    };

    return HttpResponse.json(mockExpenses[expenseIndex]);
  }),

  http.delete(`${API_BASE_URL}/api/v1/expenses/:id`, ({ params }) => {
    const expenseId = parseInt(params.id as string);
    const expenseIndex = mockExpenses.findIndex(exp => exp.id === expenseId);

    if (expenseIndex === -1) {
      return HttpResponse.json(
        { detail: 'Expense not found' },
        { status: 404 }
      );
    }

    mockExpenses.splice(expenseIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Management endpoints
  http.get(`${API_BASE_URL}/api/v1/business-units/`, () => {
    return HttpResponse.json(mockBusinessUnits);
  }),

  http.post(`${API_BASE_URL}/api/v1/business-units/`, async ({ request }) => {
    const data = await request.json() as { name: string };
    const newBU = {
      id: mockBusinessUnits.length + 1,
      name: data.name,
    };
    mockBusinessUnits.push(newBU);
    return HttpResponse.json(newBU, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/api/v1/business-units/:id`, async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const data = await request.json() as { name?: string };
    const buIndex = mockBusinessUnits.findIndex(bu => bu.id === id);

    if (buIndex === -1) {
      return HttpResponse.json(
        { detail: 'Business unit not found' },
        { status: 404 }
      );
    }

    mockBusinessUnits[buIndex] = { ...mockBusinessUnits[buIndex], name: data.name || mockBusinessUnits[buIndex].name };
    return HttpResponse.json(mockBusinessUnits[buIndex]);
  }),

  http.delete(`${API_BASE_URL}/api/v1/business-units/:id`, ({ params }) => {
    const id = parseInt(params.id as string);
    const buIndex = mockBusinessUnits.findIndex(bu => bu.id === id);

    if (buIndex === -1) {
      return HttpResponse.json(
        { detail: 'Business unit not found' },
        { status: 404 }
      );
    }

    // Check if referenced by expenses
    const referencingExpenses = mockExpenses.filter(exp => exp.business_unit_id === id);
    if (referencingExpenses.length > 0) {
      return HttpResponse.json(
        { detail: `Cannot delete business_unit: ${referencingExpenses.length} expense(s) reference it` },
        { status: 400 }
      );
    }

    mockBusinessUnits.splice(buIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_BASE_URL}/api/v1/trucks/`, () => {
    return HttpResponse.json(mockTrucks);
  }),

  http.post(`${API_BASE_URL}/api/v1/trucks/`, async ({ request }) => {
    const data = await request.json() as { number: string };
    const newTruck = {
      id: mockTrucks.length + 1,
      number: data.number,
    };
    mockTrucks.push(newTruck);
    return HttpResponse.json(newTruck, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/api/v1/trailers/`, () => {
    return HttpResponse.json(mockTrailers);
  }),

  http.get(`${API_BASE_URL}/api/v1/fuel-stations/`, () => {
    return HttpResponse.json(mockFuelStations);
  }),

  // Error simulation endpoints for testing error handling
  http.get(`${API_BASE_URL}/api/v1/test-error`, () => {
    return HttpResponse.json(
      { detail: 'Simulated server error' },
      { status: 500 }
    );
  }),

  http.get(`${API_BASE_URL}/api/v1/test-timeout`, () => {
    // Simulate timeout by delaying response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(HttpResponse.json({ message: 'Delayed response' }));
      }, 10000); // 10 second delay
    });
  }),
];
