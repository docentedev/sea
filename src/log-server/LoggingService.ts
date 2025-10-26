import { LoggingDatabaseConnection } from './logs/connection.js';
import { LogEntry } from './logs/schema.js';

export class LoggingService {
  private db = LoggingDatabaseConnection.getConnection();

  async log(entry: Omit<LogEntry, 'id' | 'createdAt'>): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO logs (timestamp, level, service, message, userId, userEmail, ipAddress, userAgent, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      entry.timestamp,
      entry.level,
      entry.service,
      entry.message,
      entry.userId || null,
      entry.userEmail || null,
      entry.ipAddress || null,
      entry.userAgent || null,
      entry.metadata || null
    );

    return result.lastInsertRowid as number;
  }

  async getLogs(options: {
    limit?: number;
    offset?: number;
    level?: string;
    service?: string;
    userId?: number;
    userEmail?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<LogEntry[]> {
    let query = 'SELECT * FROM logs WHERE 1=1';
    const params: any[] = [];

    if (options.level) {
      query += ' AND level = ?';
      params.push(options.level);
    }

    if (options.service) {
      query += ' AND service = ?';
      params.push(options.service);
    }

    if (options.userId) {
      query += ' AND userId = ?';
      params.push(options.userId);
    }

    if (options.userEmail) {
      query += ' AND userEmail = ?';
      params.push(options.userEmail);
    }

    if (options.startDate) {
      query += ' AND timestamp >= ?';
      params.push(options.startDate);
    }

    if (options.endDate) {
      query += ' AND timestamp <= ?';
      params.push(options.endDate);
    }

    query += ' ORDER BY timestamp DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as LogEntry[];

    return rows;
  }

  async getLogById(id: number): Promise<LogEntry | null> {
    const stmt = this.db.prepare('SELECT * FROM logs WHERE id = ?');
    const row = stmt.get(id) as LogEntry | undefined;
    return row || null;
  }

  async deleteOldLogs(daysToKeep: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const stmt = this.db.prepare('DELETE FROM logs WHERE timestamp < ?');
    const result = stmt.run(cutoffDate.toISOString());
    return result.changes as number;
  }

  async getLogStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byService: Record<string, number>;
    dateRange: { oldest: string; newest: string };
  }> {
    // Total de logs
    const totalStmt = this.db.prepare('SELECT COUNT(*) as total FROM logs');
    const total = (totalStmt.get() as { total: number }).total;

    // Estadísticas por nivel
    const levelStmt = this.db.prepare(`
      SELECT level, COUNT(*) as count
      FROM logs
      GROUP BY level
    `);
    const levelStats = levelStmt.all() as { level: string; count: number }[];
    const byLevel = levelStats.reduce((acc, stat) => {
      acc[stat.level] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas por servicio
    const serviceStmt = this.db.prepare(`
      SELECT service, COUNT(*) as count
      FROM logs
      GROUP BY service
    `);
    const serviceStats = serviceStmt.all() as { service: string; count: number }[];
    const byService = serviceStats.reduce((acc, stat) => {
      acc[stat.service] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    // Rango de fechas
    const dateStmt = this.db.prepare(`
      SELECT
        MIN(timestamp) as oldest,
        MAX(timestamp) as newest
      FROM logs
    `);
    const dateRange = dateStmt.get() as { oldest: string; newest: string };

    return {
      total,
      byLevel,
      byService,
      dateRange
    };
  }
}