import type { HealthResponse, LoginRequest, LoginResponse, User, UsersResponse, CreateUserRequest, UpdateUserRequest, ApiResponse, RolesResponse, FilesResponse, FileUploadResponse, FileUploadConfig, FolderContentResponse, Folder, FolderResponse, FileInfo, Configuration, ConfigurationsResponse, ConfigurationResponse, CreateConfigurationRequest, UpdateConfigurationRequest, LogsResponse, Permission, PermissionsResponse, Role } from '../types/api';
import { ApiError } from '../types/api';

class ApiService {
  // Permisos por rol
  async getRolePermissions(roleId: number): Promise<number[]> {
    const res = await this.get<{ success: boolean; data: { permissionIds: number[] }; timestamp: string }>(`/api/roles/${roleId}/permissions`);
    return res.data.permissionIds;
  }

  async setRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    await this.put(`/api/roles/${roleId}/permissions`, { permissionIds });
  }
  // Métodos REST genéricos para endpoints personalizados
  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
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

  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search && search.trim()) {
      params.append('q', search.trim());
    }

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

  async getAllFiles(page: number = 1, limit: number = 20): Promise<FilesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await this.request<ApiResponse<FilesResponse>>(`/api/files/all?${params}`);
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

  async downloadFile(fileId: number, action: 'download' | 'preview' = 'download'): Promise<Blob> {
    const token = localStorage.getItem('auth_token');

    const params = new URLSearchParams();
    if (action) {
      params.append('action', action);
    }

    const response = await fetch(`${this.baseURL}/api/files/${fileId}/download?${params}`, {
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

  async moveFiles(fileIds: number[], destinationPath: string): Promise<{ movedFiles: FileInfo[], destinationPath: string }> {
    const response = await this.request<ApiResponse<{ movedFiles: FileInfo[], destinationPath: string }>>('/api/files/move', {
      method: 'PUT',
      body: JSON.stringify({
        fileIds,
        destinationPath,
      }),
    });
    return response.data;
  }

  async deleteFolder(folderPath: string): Promise<void> {
    return this.request<void>(`/api/folders?${new URLSearchParams({ path: folderPath })}`, {
      method: 'DELETE',
    });
  }

  async getFileUploadConfig(): Promise<FileUploadConfig> {
    const response = await this.request<ApiResponse<FileUploadConfig>>('/api/files/upload/config');
    return response.data;
  }

  // Folder methods
  async getAllFolders(): Promise<Folder[]> {
    const response = await this.request<{ success: boolean; data: Folder[] }>('/api/virtual-folders');
    return response.data;
  }

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

  // Configuration methods
  async getConfigurations(): Promise<Configuration[]> {
    const response = await this.request<ConfigurationsResponse>('/api/configurations');
    return response.data;
  }

  async getConfiguration(id: number): Promise<Configuration> {
    const response = await this.request<ConfigurationResponse>(`/api/configurations/${id}`);
    return response.data;
  }

  async getConfigurationByName(name: string): Promise<Configuration> {
    const response = await this.request<ConfigurationResponse>(`/api/configurations/name/${encodeURIComponent(name)}`);
    return response.data;
  }

  async createConfiguration(data: CreateConfigurationRequest): Promise<Configuration> {
    const response = await this.request<ConfigurationResponse>('/api/configurations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateConfiguration(id: number, data: UpdateConfigurationRequest): Promise<Configuration> {
    const response = await this.request<ConfigurationResponse>(`/api/configurations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteConfiguration(id: number): Promise<void> {
    await this.request<void>(`/api/configurations/${id}`, {
      method: 'DELETE',
    });
  }

  async getConfigurationValue(name: string): Promise<{ name: string; value: string }> {
    const response = await this.request<ApiResponse<{ name: string; value: string }>>(`/api/configurations/value/${encodeURIComponent(name)}`);
    return response.data;
  }

  async setConfigurationValue(name: string, value: string): Promise<Configuration> {
    const response = await this.request<ConfigurationResponse>(`/api/configurations/value/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
    return response.data;
  }

  async getLogs(page: number = 1, pageSize: number = 50, filters?: import("../components/LogFilters").LogFiltersState): Promise<LogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (filters) {
      if (filters.level) params.append("level", filters.level);
      if (filters.service) params.append("service", filters.service);
      if (filters.userId) params.append("userId", String(filters.userId));
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
    }
    const response = await this.request<ApiResponse<LogsResponse>>(`/api/logs?${params}`);
    return response.data;
  }

  // Métodos específicos para permisos
  async getPermissions(): Promise<{ success: boolean; data: PermissionsResponse; timestamp: string }> {
    return this.get<{ success: boolean; data: PermissionsResponse; timestamp: string }>('/api/permissions');
  }

  async createPermission(data: { name: string; description: string }): Promise<{ success: boolean; data: { permission: Permission }; timestamp: string }> {
    return this.post<{ success: boolean; data: { permission: Permission }; timestamp: string }>('/api/permissions', data);
  }

  async updatePermission(id: number, data: { name: string; description: string }): Promise<{ success: boolean; data: { permission: Permission }; timestamp: string }> {
    return this.put<{ success: boolean; data: { permission: Permission }; timestamp: string }>(`/api/permissions/${id}`, data);
  }

  async deletePermission(id: number): Promise<{ success: boolean; message: string; timestamp: string }> {
    return this.delete<{ success: boolean; message: string; timestamp: string }>(`/api/permissions/${id}`);
  }

  // Métodos específicos para roles
  async createRole(data: Partial<Role>): Promise<Role> {
    const response = await this.post<ApiResponse<Role>>('/api/roles', data);
    return response.data;
  }

  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    const response = await this.put<ApiResponse<Role>>(`/api/roles/${id}`, data);
    return response.data;
  }

  async deleteRole(id: number): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/api/roles/${id}`);
  }
}

export const apiService = new ApiService();