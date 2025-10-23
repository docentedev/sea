export interface ServerConfig {
  port: number;
  host: string;
  logger: boolean;
  trustProxy: boolean;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  isSEA: boolean;
  version: string;
  performance?: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
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

export interface EchoRequest {
  message?: string;
  data?: any;
  [key: string]: any;
}

export interface EchoResponse {
  echo: EchoRequest;
  received: string;
  from: string | undefined;
  isSEA: boolean;
  headers: Record<string, any>;
  requestId: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  isSEA: boolean;
  statusCode: number;
  path?: string;
}