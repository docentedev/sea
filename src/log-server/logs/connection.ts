import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { databaseConfig, isSEA } from '../../config/index.js';

export class LoggingDatabaseConnection {
  private static instance: DatabaseSync | null = null;
  private static dbPath: string;

  static getConnection(): DatabaseSync {
    if (!this.instance) {
      this.ensureDataDirectory();
      this.instance = new DatabaseSync(this.dbPath);
      this.instance.exec('PRAGMA foreign_keys = ON');
      this.instance.exec('PRAGMA journal_mode = WAL');
    }
    return this.instance;
  }

  static getDbPath(): string {
    if (!this.dbPath) {
      // Usar configuración del archivo para logs, o ruta por defecto
      const configPath = databaseConfig?.logsPath || './data/logs.db';

      // Si es una ruta relativa y estamos en SEA, resolver desde el directorio del ejecutable
      if (!configPath.startsWith('/') && isSEA) {
        const execDir = dirname(process.execPath);
        this.dbPath = join(execDir, configPath);
      } else if (!configPath.startsWith('/')) {
        // Ruta relativa en desarrollo
        this.dbPath = join(process.cwd(), configPath);
      } else {
        // Ruta absoluta
        this.dbPath = configPath;
      }
    }
    return this.dbPath;
  }

  private static ensureDataDirectory(): void {
    const dbPath = this.getDbPath();
    const dataDir = dirname(dbPath);
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
  }

  static close(): void {
    if (this.instance) {
      this.instance.close();
      this.instance = null;
    }
  }
}