import { LoggingDatabaseConnection } from './connection.js';

export interface LogEntry {
  id?: number;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  userId?: number;
  userEmail?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string; // JSON string
  createdAt: string;
}

export class LoggingDatabaseSchema {
  static initialize(): void {
    const db = LoggingDatabaseConnection.getConnection();

        // Crear tabla de logs
    db.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
        service TEXT NOT NULL,
        message TEXT NOT NULL,
        userId INTEGER,
        userEmail TEXT,
        username TEXT,
        ipAddress TEXT,
        userAgent TEXT,
        metadata TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear índices para búsquedas eficientes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
      CREATE INDEX IF NOT EXISTS idx_logs_service ON logs(service);
      CREATE INDEX IF NOT EXISTS idx_logs_userId ON logs(userId);
      CREATE INDEX IF NOT EXISTS idx_logs_userEmail ON logs(userEmail);
      CREATE INDEX IF NOT EXISTS idx_logs_username ON logs(username);
    `);
  }

  static getDbPath(): string {
    return LoggingDatabaseConnection.getDbPath();
  }
}