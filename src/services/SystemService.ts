import { HealthResponse, InfoResponse, TimeResponse } from '../types';
import { appConfig, isSEA, config } from '../config';
import { DatabaseService } from './DatabaseService';
import process from 'process';
// Removed invalid import of CpuUsage

export class SystemService {
  private startTime: number;
  private cpuUsageBase: ReturnType<typeof process.cpuUsage>;
  private database: DatabaseService;

  constructor() {
    this.startTime = Date.now();
    this.cpuUsageBase = process.cpuUsage();
    this.database = new DatabaseService();
  }

  getHealth(): HealthResponse {
    try {
      const databaseHealth = this.database.getHealth();
      const databaseStats = this.database.getStats();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
          status: databaseHealth.status,
          message: databaseHealth.message,
          latency: 0,
          stats: databaseStats
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
          status: 'unhealthy',
          message: `Database error: ${error}`,
          latency: 0
        }
      };
    }
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

  getDatabaseService(): DatabaseService {
    return this.database;
  }

  getStats() {
    return this.database.getStats();
  }

  close(): void {
    this.database.close();
  }
}