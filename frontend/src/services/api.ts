const API_BASE_URL = 'http://127.0.0.1:8000';

// Auth token management
export const authService = {
  getToken() {
    return localStorage.getItem('access_token');
  },

  setToken(token: string) {
    localStorage.setItem('access_token', token);
  },

  removeToken() {
    localStorage.removeItem('access_token');
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
      body: new URLSearchParams({
        username: credentials.email,
        password: credentials.password
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        if (error.detail) {
          if (Array.isArray(error.detail)) {
            errorMessage = error.detail.map((err: { msg?: string; message?: string }) => err.msg || err.message || String(err)).join(', ');
          } else {
            errorMessage = error.detail;
          }
        }
      } catch {
        errorMessage = `Login failed (${response.status})`;
      }
      throw new Error(errorMessage);
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
  
  console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
  console.log(`Token exists: ${!!token}`);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  console.log(`Response status: ${response.status}`);

  if (!response.ok) {
    if (response.status === 401) {
      console.log('Authentication failed, redirecting to login');
      authService.logout();
      window.location.href = '/login';
      return;
    }
    const error = await response.json();
    console.error(`API Error: ${response.status} - ${error.detail || 'API request failed'}`);
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

  async getById(id: number) {
    return apiRequest(`/api/v1/expenses/${id}`);
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

  async updateBusinessUnit(id: number, data: { name: string }) {
    return apiRequest(`/api/v1/business-units/${id}`, {
      method: 'PUT',
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

  async updateTruck(id: number, data: { number: string }) {
    return apiRequest(`/api/v1/trucks/${id}`, {
      method: 'PUT',
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

  async updateTrailer(id: number, data: { number: string }) {
    return apiRequest(`/api/v1/trailers/${id}`, {
      method: 'PUT',
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

  async updateFuelStation(id: number, data: { name: string }) {
    return apiRequest(`/api/v1/fuel-stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteBusinessUnit(id: number) {
    return apiRequest(`/api/v1/business-units/${id}`, { method: 'DELETE' });
  },

  async deleteTruck(id: number) {
    return apiRequest(`/api/v1/trucks/${id}`, { method: 'DELETE' });
  },

  async deleteTrailer(id: number) {
    return apiRequest(`/api/v1/trailers/${id}`, { method: 'DELETE' });
  },

  async deleteFuelStation(id: number) {
    return apiRequest(`/api/v1/fuel-stations/${id}`, { method: 'DELETE' });
  },
};
