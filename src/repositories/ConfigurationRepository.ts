import { DatabaseSync } from 'node:sqlite';
import { Configuration, CreateConfigurationData, UpdateConfigurationData } from '../models/Configuration.js';

export class ConfigurationRepository {
  constructor(private db: DatabaseSync) {}

  findAll(): Configuration[] {
    const stmt = this.db.prepare(`
      SELECT id, name, value, created_at, updated_at
      FROM configurations
      ORDER BY name
    `);

    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToConfiguration);
  }

  findById(id: number): Configuration | null {
    const stmt = this.db.prepare(`
      SELECT id, name, value, created_at, updated_at
      FROM configurations
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    return row ? this.mapRowToConfiguration(row) : null;
  }

  findByName(name: string): Configuration | null {
    const stmt = this.db.prepare(`
      SELECT id, name, value, created_at, updated_at
      FROM configurations
      WHERE name = ?
    `);

    const row = stmt.get(name) as any;
    return row ? this.mapRowToConfiguration(row) : null;
  }

  create(data: CreateConfigurationData): Configuration {
    const stmt = this.db.prepare(`
      INSERT INTO configurations (name, value, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(data.name, data.value);
    const id = result.lastInsertRowid as number;

    return {
      id,
      name: data.name,
      value: data.value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  update(id: number, data: UpdateConfigurationData): Configuration | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.value !== undefined) {
      updates.push('value = ?');
      values.push(data.value);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = datetime(\'now\')');
    const stmt = this.db.prepare(`
      UPDATE configurations
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    values.push(id);
    stmt.run(...values);

    return this.findById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM configurations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getValue(name: string): string | null {
    const config = this.findByName(name);
    return config ? config.value : null;
  }

  setValue(name: string, value: string): Configuration {
    const existing = this.findByName(name);
    if (existing) {
      return this.update(existing.id, { value })!;
    } else {
      return this.create({ name, value });
    }
  }

  private mapRowToConfiguration(row: any): Configuration {
    return {
      id: row.id,
      name: row.name,
      value: row.value,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}