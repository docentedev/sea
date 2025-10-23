import { DatabaseSync } from 'node:sqlite';
import { Role, CreateRoleData, UpdateRoleData } from '../models/Role.js';

export class RoleRepository {
  constructor(private db: DatabaseSync) {}

  findAll(): Role[] {
    const stmt = this.db.prepare(`
      SELECT id, name, display_name, permissions, can_share, can_admin, 
             max_storage_gb, created_at
      FROM roles 
      ORDER BY name
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToRole);
  }

  findById(id: number): Role | null {
    const stmt = this.db.prepare(`
      SELECT id, name, display_name, permissions, can_share, can_admin, 
             max_storage_gb, created_at
      FROM roles 
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    return row ? this.mapRowToRole(row) : null;
  }

  findByName(name: string): Role | null {
    const stmt = this.db.prepare(`
      SELECT id, name, display_name, permissions, can_share, can_admin, 
             max_storage_gb, created_at
      FROM roles 
      WHERE name = ?
    `);
    
    const row = stmt.get(name) as any;
    return row ? this.mapRowToRole(row) : null;
  }

  create(roleData: CreateRoleData): Role {
    const stmt = this.db.prepare(`
      INSERT INTO roles (name, display_name, permissions, can_share, can_admin, max_storage_gb)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      roleData.name,
      roleData.display_name,
      JSON.stringify(roleData.permissions),
      roleData.can_share ? 1 : 0,
      roleData.can_admin ? 1 : 0,
      roleData.max_storage_gb || 10
    );

    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error('Failed to create role');
    }
    
    return created;
  }

  update(id: number, updateData: UpdateRoleData): Role | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    if (updateData.display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(updateData.display_name);
    }
    if (updateData.permissions !== undefined) {
      updates.push('permissions = ?');
      params.push(JSON.stringify(updateData.permissions));
    }
    if (updateData.can_share !== undefined) {
      updates.push('can_share = ?');
      params.push(updateData.can_share ? 1 : 0);
    }
    if (updateData.can_admin !== undefined) {
      updates.push('can_admin = ?');
      params.push(updateData.can_admin ? 1 : 0);
    }
    if (updateData.max_storage_gb !== undefined) {
      updates.push('max_storage_gb = ?');
      params.push(updateData.max_storage_gb);
    }

    if (updates.length === 0) return existing;

    params.push(id);
    const stmt = this.db.prepare(`
      UPDATE roles SET ${updates.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...params);
    return this.findById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM roles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToRole(row: any): Role {
    return {
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      permissions: JSON.parse(row.permissions),
      can_share: Boolean(row.can_share),
      can_admin: Boolean(row.can_admin),
      max_storage_gb: row.max_storage_gb,
      created_at: row.created_at
    };
  }
}