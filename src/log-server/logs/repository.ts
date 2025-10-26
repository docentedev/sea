import { LoggingDatabaseConnection } from './connection.js';
import { LogEntry } from './schema.js';

export class LoggingRepository {
  private db = LoggingDatabaseConnection.getConnection();

  create(logEntry: Omit<LogEntry, 'id' | 'createdAt'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO logs (timestamp, level, service, message, userId, userEmail, username, ipAddress, userAgent, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      logEntry.timestamp,
      logEntry.level,
      logEntry.service,
      logEntry.message,
      logEntry.userId || null,
      logEntry.userEmail || null,
      logEntry.username || null,
      logEntry.ipAddress || null,
      logEntry.userAgent || null,
      logEntry.metadata ? JSON.stringify(logEntry.metadata) : null
    );

    return result.lastInsertRowid as number;
  }

  findAll(limit: number = 100, offset: number = 0): LogEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM logs
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(limit, offset) as any[];
    return rows.map(this.mapRowToLogEntry);
  }

  findByService(service: string, limit: number = 100): LogEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM logs
      WHERE service = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const rows = stmt.all(service, limit) as any[];
    return rows.map(this.mapRowToLogEntry);
  }

  findByLevel(level: string, limit: number = 100): LogEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM logs
      WHERE level = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const rows = stmt.all(level, limit) as any[];
    return rows.map(this.mapRowToLogEntry);
  }

  findByUserId(userId: number, limit: number = 100): LogEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM logs
      WHERE userId = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const rows = stmt.all(userId, limit) as any[];
    return rows.map(this.mapRowToLogEntry);
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM logs');
    const result = stmt.get() as any;
    return result.count;
  }

  private mapRowToLogEntry(row: any): LogEntry {
    return {
      id: row.id,
      timestamp: row.timestamp,
      level: row.level,
      service: row.service,
      message: row.message,
      userId: row.userId,
      userEmail: row.userEmail,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.createdAt,
    };
  }

  /*
  const logs = await this.loggingRepo.getLogs(filters, offset, parseInt(pageSize, 10));
          const totalLogs = await this.loggingRepo.countLogs(filters);
*/
  getLogs(
    filters: {
      level?: string;
      service?: string;
      userId?: number;
      startDate?: string;
      endDate?: string;
    },
    offset: number,
    limit: number
  ): LogEntry[] {
    let query = 'SELECT * FROM logs WHERE 1=1';
    const params: any[] = [];

    if (filters.level) {
      query += ' AND level = ?';
      params.push(filters.level);
    }
    if (filters.service) {
      query += ' AND service = ?';
      params.push(filters.service);
    }
    if (filters.userId) {
      query += ' AND userId = ?';
      params.push(filters.userId);
    }
    if (filters.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    return rows.map(this.mapRowToLogEntry);
  }

  countLogs(filters: {
    level?: string;
    service?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }): number {
    let query = 'SELECT COUNT(*) as count FROM logs WHERE 1=1';
    const params: any[] = [];

    if (filters.level) {
      query += ' AND level = ?';
      params.push(filters.level);
    }
    if (filters.service) {
      query += ' AND service = ?';
      params.push(filters.service);
    }
    if (filters.userId) {
      query += ' AND userId = ?';
      params.push(filters.userId);
    }
    if (filters.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filters.endDate);
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as any;
    return result.count;
  }
}