import { DatabaseSync } from 'node:sqlite';
import { Role, CreateRoleData, UpdateRoleData } from '../models/Role.js';

export class RoleRepository {
  constructor(private db: DatabaseSync) {}

  findAll(): Role[] {
    const stmt = this.db.prepare(`
      SELECT id, name, display_name, max_storage_gb, created_at
      FROM roles 
      ORDER BY name
    `);
    const rows = stmt.all() as any[];
    return rows.map(row => this.mapRowToRole(row));
  }

  findById(id: number): Role | null {
    const stmt = this.db.prepare(`
      SELECT id, name, display_name, max_storage_gb, created_at
      FROM roles 
      WHERE id = ?
    `);
    const row = stmt.get(id) as any;
    return row ? this.mapRowToRole(row) : null;
  }

  findByName(name: string): Role | null {
    const stmt = this.db.prepare(`
      SELECT id, name, display_name, max_storage_gb, created_at
      FROM roles 
      WHERE name = ?
    `);
    const row = stmt.get(name) as any;
    return row ? this.mapRowToRole(row) : null;
  }

  create(roleData: CreateRoleData): Role {
    const stmt = this.db.prepare(`
      INSERT INTO roles (name, display_name, max_storage_gb)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(
      roleData.name,
      roleData.display_name,
      roleData.max_storage_gb || 10
    );
    // Insertar permisos en la tabla intermedia role_permissions
    const roleId = Number(result.lastInsertRowid);
    if (roleData.permissions && Array.isArray(roleData.permissions)) {
      for (const permName of roleData.permissions) {
        // Buscar el id del permiso por su nombre
        const permRow = this.db.prepare('SELECT id FROM permissions WHERE name = ?').get(permName);
        if (permRow && permRow.id) {
          this.db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)').run(roleId, permRow.id);
        }
      }
    }
    const created = this.findById(roleId);
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
    if (updateData.max_storage_gb !== undefined) {
      updates.push('max_storage_gb = ?');
      params.push(updateData.max_storage_gb);
    }

    if (updates.length > 0) {
      params.push(id);
      const stmt = this.db.prepare(`
        UPDATE roles SET ${updates.join(', ')} WHERE id = ?
      `);
      stmt.run(...params);
    }

    // Actualizar permisos en la tabla intermedia role_permissions
    if (updateData.permissions !== undefined) {
      // Eliminar permisos actuales
      this.db.prepare('DELETE FROM role_permissions WHERE role_id = ?').run(id);
      // Insertar nuevos permisos
      for (const permName of updateData.permissions) {
        const permRow = this.db.prepare('SELECT id FROM permissions WHERE name = ?').get(permName);
        if (permRow && permRow.id) {
          this.db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)').run(id, permRow.id);
        }
      }
    }
    return this.findById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM roles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToRole(row: any): Role {
    // Obtener nombres de permisos asociados al rol mediante JOIN
    const permStmt = this.db.prepare(`
      SELECT p.name FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ?
    `);
    const perms = permStmt.all(row.id).map((p: any) => p.name);
    return {
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      permissions: perms,
      max_storage_gb: row.max_storage_gb,
      created_at: row.created_at
    };
  }
}