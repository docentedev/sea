import { DatabaseSync } from 'node:sqlite';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export class DatabaseConnection {
  private static instance: DatabaseSync | null = null;
  private static readonly DB_PATH = join(process.cwd(), 'data', 'nas-cloud.db');

  static getConnection(): DatabaseSync {
    if (!this.instance) {
      this.ensureDataDirectory();
      this.instance = new DatabaseSync(this.DB_PATH);
      this.instance.exec('PRAGMA foreign_keys = ON');
      this.instance.exec('PRAGMA journal_mode = WAL');
    }
    return this.instance;
  }

  static getDbPath(): string {
    return this.DB_PATH;
  }

  private static ensureDataDirectory(): void {
    const dataDir = join(process.cwd(), 'data');
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