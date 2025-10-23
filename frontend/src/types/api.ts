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