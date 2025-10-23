import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';

export interface ServerConfig {
  port: number;
  host: string;
  logger: boolean;
  trustProxy: boolean;
}

export interface SystemInfo {
  isSEA: boolean;
  process: {
    pid: number;
    version: string;
    platform: string;
    arch: string;
    execPath: string;
    argv: string[];
    cwd: string;
    uptime: number;
  };
  memory: NodeJS.MemoryUsage;
  timestamp: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  isSEA: boolean;
  version: string;
  database?: {
    status: string;
    message: string;
    latency: number;
    stats?: {
      total_users: number;
      active_users: number;
      total_roles: number;
      total_storage_used_gb: number;
      database_size_mb: number;
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  isSEA: boolean;
}

export interface TimeResponse {
  timestamp: string;
  unixTime: number;
  timezone: string;
  isSEA: boolean;
}

export interface EchoRequest {
  message?: string;
  [key: string]: any;
}

export interface EchoResponse {
  echo: any;
  received: string;
  from: string;
  isSEA: boolean;
  headers: any;
  requestId?: string;
}

// Database types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseStats {
  users: number;
  tasks: {
    total: number;
    completed: number;
    pending: number;
    completion_rate: number;
  };
  database: {
    path: string;
    isSEA: boolean;
    size: string;
  };
}

// Request types for API endpoints
export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
}

export interface CreateTaskRequest {
  user_id: number;
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  completed?: boolean;
}

// Fastify types
export type FastifyHandler<T extends RouteGenericInterface = any> = (
  request: FastifyRequest<T>,
  reply: FastifyReply
) => Promise<any> | any;

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  database?: {
    status: string;
    message: string;
    latency: number;
    stats?: {
      total_users: number;
      active_users: number;
      total_roles: number;
      total_storage_used_gb: number;
      database_size_mb: number;
    };
  };
}

export interface InfoResponse {
  process: {
    pid: number;
    version: string;
    platform: string;
    arch: string;
    execPath: string;
    argv: string[];
    cwd: string;
    uptime: number;
  };
  system: {
    isSEA: boolean;
    memory: NodeJS.MemoryUsage;
    env: {
      NODE_ENV: string;
      PORT: string;
    };
  };
  server: {
    host: string;
    port: number;
    timestamp: string;
    framework: string;
    version: string;
  };
}

export interface TimeResponse {
  timestamp: string;
  unixTime: number;
  timezone: string;
  isSEA: boolean;
  iso8601: string;
  locale: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  isSEA: boolean;
  statusCode: number;
  path?: string;
}