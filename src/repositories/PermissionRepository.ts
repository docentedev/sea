import { DatabaseSync } from 'node:sqlite';
import { Permission, CreatePermissionData, UpdatePermissionData } from '../models/Permission.js';

export class PermissionRepository {
  constructor(private db: DatabaseSync) {}

  findAll(): Permission[] {
    const stmt = this.db.prepare(`
      SELECT id, name, description, created_at FROM permissions ORDER BY name
    `);
    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToPermission);
  }

  findById(id: number): Permission | null {
    const stmt = this.db.prepare(`
      SELECT id, name, description, created_at FROM permissions WHERE id = ?
    `);
    const row = stmt.get(id) as any;
    return row ? this.mapRowToPermission(row) : null;
  }

  findByName(name: string): Permission | null {
    const stmt = this.db.prepare(`
      SELECT id, name, description, created_at FROM permissions WHERE name = ?
    `);
    const row = stmt.get(name) as any;
    return row ? this.mapRowToPermission(row) : null;
  }

  create(data: CreatePermissionData): Permission {
    const stmt = this.db.prepare(`
      INSERT INTO permissions (name, description) VALUES (?, ?)
    `);
    const result = stmt.run(data.name, data.description);
    return this.findById(Number(result.lastInsertRowid))!;
  }

  update(id: number, data: UpdatePermissionData): Permission | null {
    const updates: string[] = [];
    const params: any[] = [];
    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (updates.length === 0) return this.findById(id);
    params.push(id);
    const stmt = this.db.prepare(`
      UPDATE permissions SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...params);
    return this.findById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM permissions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToPermission(row: any): Permission {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      created_at: row.created_at
    };
  }
}
