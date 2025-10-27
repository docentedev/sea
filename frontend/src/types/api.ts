export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  database: {
    status: 'healthy' | 'unhealthy';
    message: string;
    latency: number;
    stats: {
      total_users: number;
      active_users: number;
      total_roles: number;
      total_storage_used_gb: number;
      database_size_mb: number;
    };
  };
}

export class ApiError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role | string; // Puede ser un objeto Role o un string para compatibilidad
  createdAt: string;
  updatedAt: string;
  storage_quota_gb?: number;
  storage_used_gb?: number;
  is_active?: boolean;
  created_at?: string; // Para compatibilidad con la API
  updated_at?: string; // Para compatibilidad con la API
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  permissions: string[];
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: number;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: number;
  storage_quota_gb?: number;
}

export interface RolesResponse {
  roles: Role[];
}

// File types
export interface FileInfo {
  id: number;
  filename: string;
  original_filename: string;
  size: number;
  mime_type: string;
  path: string;
  folder_path: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface FilesResponse {
  files: FileInfo[];
  total: number;
  page: number;
  limit: number;
}

export interface FileUploadResponse {
  success: boolean;
  files: FileInfo[];
  message?: string;
}

export interface FileUploadConfig {
  maxFileSize: number;
  maxFilesPerUpload: number;
  allowedFileTypes: string[];
  blockedFileExtensions: string[];
  allowedFileExtensions?: string[];
  defaultFileView?: 'table' | 'cards';
}

// Folder types
export interface Folder {
  id: number;
  name: string;
  path: string;
  parent_path: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface FolderContent {
  folders: Folder[];
  files: FileInfo[];
  current_path: string;
  parent_path: string | null;
}

export interface FolderResponse {
  success: boolean;
  data: Folder;
  timestamp: string;
}

export interface FolderContentResponse {
  success: boolean;
  data: FolderContent;
  timestamp: string;
}

export interface FoldersResponse {
  success: boolean;
  data: Folder[];
  timestamp: string;
}

// Configuration types
export interface Configuration {
  id: number;
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface ConfigurationsResponse {
  success: boolean;
  data: Configuration[];
  timestamp: string;
}

export interface ConfigurationResponse {
  success: boolean;
  data: Configuration;
  timestamp: string;
}

export interface CreateConfigurationRequest {
  name: string;
  value: string;
}

export interface UpdateConfigurationRequest {
  name?: string;
  value?: string;
}


// get /api/logs
export interface Log {
  id: number;
  timestamp: string;
  level: string;
  service: string;
  message: string;
  userId: number | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface LogsResponse {
  logs: Log[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface PermissionsResponse {
  permissions: Permission[];
  timestamp: string;
  success: boolean;
}