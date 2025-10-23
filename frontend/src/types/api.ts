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