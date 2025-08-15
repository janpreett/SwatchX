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
  
      // Making API request
  
  // Build headers, but don't set Content-Type for FormData
  const headers: Record<string, string> = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };
  
  // Only set Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

          // Response received

  if (!response.ok) {
    if (response.status === 401) {
              // Authentication failed, redirecting to login
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
  price: number;
  description?: string;
  gallons?: number;
  serviceProviderId?: number;
  truckId?: number;
  trailerId?: number;
  fuelStationId?: number;
}

export const expenseService = {
  async create(expenseData: ExpenseData) {
    return apiRequest('/api/v1/expenses/', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  async createWithFile(expenseData: ExpenseData, attachment?: File | null) {
    const formData = new FormData();
    formData.append('expense_data', JSON.stringify(expenseData));
    if (attachment) {
      formData.append('attachment', attachment);
    }

    return apiRequest('/api/v1/expenses/', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header - let browser set it with boundary for multipart
      },
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

  async updateWithFile(id: number, expenseData: Partial<ExpenseData>, attachment?: File | null) {
    const formData = new FormData();
    formData.append('expense_data', JSON.stringify(expenseData));
    if (attachment) {
      formData.append('attachment', attachment);
    }

    return apiRequest(`/api/v1/expenses/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        // Don't set Content-Type header - let browser set it with boundary for multipart
      },
    });
  },

  async delete(id: number) {
    return apiRequest(`/api/v1/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  async downloadAttachment(id: number) {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}/attachment`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download attachment');
    }
    
    return response.blob();
  },

  async removeAttachment(id: number) {
    return apiRequest(`/api/v1/expenses/${id}/attachment`, {
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
  // Service Providers
  async getServiceProviders() {
    return apiRequest('/api/v1/service-providers/');
  },

  async createServiceProvider(data: { name: string }) {
    return apiRequest('/api/v1/service-providers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateServiceProvider(id: number, data: { name: string }) {
    return apiRequest(`/api/v1/service-providers/${id}`, {
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

  async deleteServiceProvider(id: number) {
    return apiRequest(`/api/v1/service-providers/${id}`, { method: 'DELETE' });
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

  // Export data
  async exportCompanyData(company: string) {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/api/v1/export/${company}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Export failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || `Export failed (${response.status})`;
      } catch {
        errorMessage = `Export failed (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.blob();
  },

  // Analytics
  async getMonthlyChange(company: string) {
    return apiRequest(`/api/v1/analytics/monthly-change/${company}`);
  },

  async getTopCategories(company: string) {
    return apiRequest(`/api/v1/analytics/top-categories/${company}`);
  },

  // Pie chart data
  async getPieChartData(company: string, period: 'this-month' | 'total') {
    return apiRequest(`/api/v1/pie-chart-data/${company}?period=${period}`);
  },
};
