const API_BASE_URL = 'http://127.0.0.1:8000';

// Auth token management
export const authService = {
  getToken() {
    return localStorage.getItem('accessToken');
  },

  setToken(token: string) {
    localStorage.setItem('accessToken', token);
  },

  removeToken() {
    localStorage.removeItem('accessToken');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    
    return { user: data.user };
  },

  async signup(userData: { email: string; password: string; confirm_password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    return response.json();
  },

  async getCurrentUser() {
    const token = this.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired');
      }
      throw new Error('Failed to get user info');
    }

    return response.json();
  },

  logout() {
    this.removeToken();
  }
};

// Generic API helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = authService.getToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      authService.logout();
      window.location.href = '/login';
      return;
    }
    const error = await response.json();
    throw new Error(error.detail || 'API request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Expense API
export interface ExpenseData {
  company: 'Swatch' | 'SWS';
  category: string;
  date: string;
  cost: number;
  description?: string;
  repair_description?: string;
  gallons?: number;
  business_unit_id?: number;
  truck_id?: number;
  trailer_id?: number;
  fuel_station_id?: number;
}

export const expenseService = {
  async create(expenseData: ExpenseData) {
    return apiRequest('/api/v1/expenses/', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  async getAll(params?: { 
    company?: string; 
    category?: string; 
    skip?: number; 
    limit?: number; 
  }) {
    const searchParams = new URLSearchParams();
    if (params?.company) searchParams.append('company', params.company);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiRequest(`/api/v1/expenses/${query ? `?${query}` : ''}`);
  },

  async update(id: number, expenseData: Partial<ExpenseData>) {
    return apiRequest(`/api/v1/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  async delete(id: number) {
    return apiRequest(`/api/v1/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Management entities API
export interface ManagementItem {
  id?: number;
  name?: string;
  number?: string;
}

export const managementService = {
  // Business Units
  async getBusinessUnits() {
    return apiRequest('/api/v1/business-units/');
  },

  async createBusinessUnit(data: { name: string }) {
    return apiRequest('/api/v1/business-units/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Trucks
  async getTrucks() {
    return apiRequest('/api/v1/trucks/');
  },

  async createTruck(data: { number: string }) {
    return apiRequest('/api/v1/trucks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Trailers
  async getTrailers() {
    return apiRequest('/api/v1/trailers/');
  },

  async createTrailer(data: { number: string }) {
    return apiRequest('/api/v1/trailers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Fuel Stations
  async getFuelStations() {
    return apiRequest('/api/v1/fuel-stations/');
  },

  async createFuelStation(data: { name: string }) {
    return apiRequest('/api/v1/fuel-stations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
