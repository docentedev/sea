import type { HealthResponse, LoginRequest, LoginResponse, User } from '../types/api';
import { ApiError } from '../types/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = '';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      };

      // Add authorization header if token exists
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('🔑 Adding auth token to request:', endpoint);
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      } else {
        console.log('❌ No auth token found for request:', endpoint);
      }

      console.log('📡 Making request to:', endpoint);
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      console.log('📡 Response status:', response.status, 'for:', endpoint);

      if (!response.ok) {
        console.error('❌ Request failed:', response.status, response.statusText);
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const result = await response.json();
      console.log('✅ Request successful for:', endpoint);
      return result;
    } catch (error) {
      console.error('❌ Request error for', endpoint, ':', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/health');
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires_at');
  }

  async getCurrentUser(): Promise<User | null> {
    // This could be used to validate token and get current user
    // For now, we'll rely on localStorage
    return null;
  }
}

export const apiService = new ApiService();