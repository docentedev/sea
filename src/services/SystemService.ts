import { HealthResponse, InfoResponse, TimeResponse } from '../types';
import { appConfig, isSEA, config } from '../config';

export class SystemService {
  private startTime: number;
  private cpuUsageBase: NodeJS.CpuUsage;

  constructor() {
    this.startTime = Date.now();
    this.cpuUsageBase = process.cpuUsage();
  }

  getHealth(): HealthResponse {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.cpuUsageBase);
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      isSEA,
      version: appConfig.version,
      performance: {
        memoryUsage,
        cpuUsage,
      },
    };
  }

  getInfo(): InfoResponse {
    return {
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        execPath: process.execPath,
        argv: process.argv,
        cwd: process.cwd(),
        uptime: process.uptime(),
      },
      system: {
        isSEA,
        memory: process.memoryUsage(),
        env: {
          NODE_ENV: process.env.NODE_ENV || 'production',
          PORT: process.env.PORT || 'default',
        },
      },
      server: {
        host: config.host,
        port: config.port,
        timestamp: new Date().toISOString(),
        framework: 'Fastify',
        version: appConfig.version,
      },
    };
  }

  getTime(): TimeResponse {
    const now = new Date();
    
    return {
      timestamp: now.toISOString(),
      unixTime: Math.floor(now.getTime() / 1000),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isSEA,
      iso8601: now.toISOString(),
      locale: Intl.DateTimeFormat().resolvedOptions().locale,
    };
  }

  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}