import type { HealthResponse, LoginRequest, LoginResponse, User, UsersResponse, CreateUserRequest, UpdateUserRequest, ApiResponse, RolesResponse, FilesResponse, FileUploadResponse, FileUploadConfig, FolderContentResponse, Folder, FolderResponse } from '../types/api';
import { ApiError } from '../types/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://localhost:3000';
  }

  getBaseUrl(): string {
    return this.baseURL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const config: RequestInit = {
        ...options,
      };

      // Only set Content-Type to application/json if there's a body
      if (options?.body) {
        config.headers = {
          'Content-Type': 'application/json',
          ...options?.headers,
        };
      } else {
        config.headers = {
          ...options?.headers,
        };
      }

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

  async getUsers(page: number = 1, limit: number = 10): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await this.request<ApiResponse<UsersResponse>>(`/api/users?${params}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number): Promise<void> {
    return this.request<void>(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getRoles(): Promise<RolesResponse> {
    const response = await this.request<ApiResponse<RolesResponse>>('/api/roles');
    return response.data;
  }

  // File methods
  async getFiles(page: number = 1, limit: number = 20): Promise<FilesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await this.request<ApiResponse<FilesResponse>>(`/api/files?${params}`);
    return response.data;
  }

  async uploadFiles(formData: FormData, virtualFolderPath?: string): Promise<FileUploadResponse> {
    const token = localStorage.getItem('auth_token');

    // Add virtual folder path to form data if provided
    if (virtualFolderPath && virtualFolderPath !== '/') {
      formData.append('virtual_folder_path', virtualFolderPath);
    }

    const response = await fetch(`${this.baseURL}/api/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }

    return response.json();
  }

  async downloadFile(fileId: number): Promise<Blob> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${this.baseURL}/api/files/${fileId}/download`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }

    return response.blob();
  }

  async deleteFile(fileId: number): Promise<void> {
    return this.request<void>(`/api/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async deleteFolder(folderPath: string): Promise<void> {
    const params = new URLSearchParams({
      path: folderPath,
    });
    return this.request<void>(`/api/folders?${params}`, {
      method: 'DELETE',
    });
  }

  async getFileUploadConfig(): Promise<FileUploadConfig> {
    const response = await this.request<ApiResponse<FileUploadConfig>>('/api/files/upload/config');
    return response.data;
  }

  // Folder methods
  async getFolderContents(folderPath: string): Promise<FolderContentResponse> {
    const params = new URLSearchParams({
      parent_path: folderPath,
    });
    return this.request<FolderContentResponse>(`/api/virtual-folders?${params}`);
  }

  async createFolder(name: string, path: string, parentPath?: string): Promise<Folder> {
    const response = await this.request<FolderResponse>('/api/virtual-folders', {
      method: 'POST',
      body: JSON.stringify({
        name,
        path,
        parent_path: parentPath || null
      }),
    });
    return response.data;
  }
}

export const apiService = new ApiService();