// Authentication service for API calls
const API_BASE_URL = 'http://127.0.0.1:8000';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  confirm_password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    is_active: boolean;
  };
}

export interface ApiError {
  detail: string;
}

class AuthService {
  public getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        if (error.detail) {
          if (Array.isArray(error.detail)) {
            errorMessage = error.detail.map((err: { msg: string }) => err.msg).join(', ');
          } else {
            errorMessage = error.detail;
          }
        }
      } catch {
        errorMessage = `Login failed (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    const result: AuthResponse = await response.json();
    this.setToken(result.access_token);
    return result;
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Signup failed';
      try {
        const error = await response.json();
        // Handle validation errors properly
        if (error.detail) {
          if (Array.isArray(error.detail)) {
            // Pydantic validation errors
            errorMessage = error.detail.map((err: { msg: string }) => err.msg).join(', ');
          } else {
            errorMessage = error.detail;
          }
        }
      } catch {
        errorMessage = `Signup failed (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    const result: AuthResponse = await response.json();
    // Don't store token for signup - let user login manually
    return result;
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  removeToken(): void {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Simple check - in production, you'd want to verify token expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  logout(): void {
    this.removeToken();
  }
}

export const authService = new AuthService();

// Management data service using the same auth system
export const managementService = {
  async getBusinessUnits() {
    const response = await fetch(`${API_BASE_URL}/api/v1/business-units/`, {
      method: 'GET',
      headers: authService.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get business units: ${response.status}`);
    }
    return response.json();
  },

  async getTrucks() {
    const response = await fetch(`${API_BASE_URL}/api/v1/trucks/`, {
      method: 'GET', 
      headers: authService.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get trucks: ${response.status}`);
    }
    return response.json();
  },

  async getTrailers() {
    const response = await fetch(`${API_BASE_URL}/api/v1/trailers/`, {
      method: 'GET',
      headers: authService.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get trailers: ${response.status}`);
    }
    return response.json();
  },

  async getFuelStations() {
    const response = await fetch(`${API_BASE_URL}/api/v1/fuel-stations/`, {
      method: 'GET',
      headers: authService.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get fuel stations: ${response.status}`);
    }
    return response.json();
  },
};

// Expense service using the same auth system  
export const expenseService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/`, {
      method: 'GET',
      headers: authService.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get expenses: ${response.status}`);
    }
    return response.json();
  },
};
