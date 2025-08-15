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

  // Security Questions Methods
  async getSecurityQuestions() {
    const response = await fetch(`${API_BASE_URL}/auth/security-questions`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get security questions');
    }

    return response.json();
  }

  async setupSecurityQuestions(questions: { question: string; answer: string }[]) {
    const response = await fetch(`${API_BASE_URL}/auth/security-questions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ questions }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to set up security questions';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = Array.isArray(error.detail) 
            ? error.detail.map((err: { msg: string }) => err.msg).join(', ')
            : error.detail;
        }
      } catch {
        errorMessage = `Failed to set up security questions (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async updateSecurityQuestions(questions: { question: string; answer: string }[]) {
    const response = await fetch(`${API_BASE_URL}/auth/security-questions`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ questions }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update security questions';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = Array.isArray(error.detail) 
            ? error.detail.map((err: { msg: string }) => err.msg).join(', ')
            : error.detail;
        }
      } catch {
        errorMessage = `Failed to update security questions (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async updateIndividualSecurityQuestion(data: { 
    question: string; 
    answer: string; 
    current_password: string; 
    question_index: number 
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/security-questions/individual`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update security question';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = Array.isArray(error.detail) 
            ? error.detail.map((err: { msg: string }) => err.msg).join(', ')
            : error.detail;
        }
      } catch {
        errorMessage = `Failed to update security question (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async changePassword(data: { current_password: string; new_password: string; confirm_password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/password/change`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to change password';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = Array.isArray(error.detail) 
            ? error.detail.map((err: { msg: string }) => err.msg).join(', ')
            : error.detail;
        }
      } catch {
        errorMessage = `Failed to change password (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async requestPasswordReset(email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/password/reset-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to request password reset';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = error.detail;
        }
      } catch {
        errorMessage = `Failed to request password reset (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async verifyPasswordReset(data: { 
    email: string; 
    answers: string[]; 
    new_password: string; 
    confirm_password: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/password/reset-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to reset password';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = Array.isArray(error.detail) 
            ? error.detail.map((err: { msg: string }) => err.msg).join(', ')
            : error.detail;
        }
      } catch {
        errorMessage = `Failed to reset password (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async updateProfile(profileData: { name?: string | null }) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update profile';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Failed to update profile (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async deleteAccount(deleteData: { password: string; confirmation_text: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/account`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify(deleteData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete account';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Failed to delete account (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
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

  async createBusinessUnit(data: { name: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/business-units/`, {
      method: 'POST',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create business unit: ${response.status}`);
    }
    return response.json();
  },

  async createTruck(data: { number: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/trucks/`, {
      method: 'POST',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create truck: ${response.status}`);
    }
    return response.json();
  },

  async createTrailer(data: { number: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/trailers/`, {
      method: 'POST',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create trailer: ${response.status}`);
    }
    return response.json();
  },

  async createFuelStation(data: { name: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/fuel-stations/`, {
      method: 'POST',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create fuel station: ${response.status}`);
    }
    return response.json();
  },

  async updateBusinessUnit(id: number, data: { name: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/business-units/${id}`, {
      method: 'PUT',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update business unit: ${response.status}`);
    }
    return response.json();
  },

  async updateTruck(id: number, data: { number: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/trucks/${id}`, {
      method: 'PUT',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update truck: ${response.status}`);
    }
    return response.json();
  },

  async updateTrailer(id: number, data: { number: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/trailers/${id}`, {
      method: 'PUT',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update trailer: ${response.status}`);
    }
    return response.json();
  },

  async updateFuelStation(id: number, data: { name: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/fuel-stations/${id}`, {
      method: 'PUT',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update fuel station: ${response.status}`);
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

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/`, {
      method: 'POST',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create expense: ${response.status}`);
    }
    return response.json();
  },

  async update(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}`, {
      method: 'PUT',
      headers: authService.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update expense: ${response.status}`);
    }
    return response.json();
  },

  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}`, {
      method: 'GET',
      headers: authService.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get expense: ${response.status}`);
    }
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}`, {
      method: 'DELETE',
      headers: authService.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete expense: ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  },
};
