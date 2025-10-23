import { DatabaseSync } from 'node:sqlite';
import { User, CreateUserData, UpdateUserData, UserWithRole } from '../models/User.js';

export class UserRepository {
  constructor(private db: DatabaseSync) {}

  findAll(): User[] {
    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, role_id, storage_quota_gb, 
             storage_used_gb, is_active, created_at, updated_at
      FROM users 
      ORDER BY username
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToUser);
  }

  findActive(): User[] {
    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, role_id, storage_quota_gb, 
             storage_used_gb, is_active, created_at, updated_at
      FROM users 
      WHERE is_active = 1
      ORDER BY username
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToUser);
  }

  findById(id: number): User | null {
    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, role_id, storage_quota_gb, 
             storage_used_gb, is_active, created_at, updated_at
      FROM users 
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  findByUsername(username: string): User | null {
    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, role_id, storage_quota_gb, 
             storage_used_gb, is_active, created_at, updated_at
      FROM users 
      WHERE username = ?
    `);
    
    const row = stmt.get(username) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  findByEmail(email: string): User | null {
    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, role_id, storage_quota_gb, 
             storage_used_gb, is_active, created_at, updated_at
      FROM users 
      WHERE email = ?
    `);
    
    const row = stmt.get(email) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  findWithRole(id: number): UserWithRole | null {
    const stmt = this.db.prepare(`
      SELECT u.id, u.username, u.email, u.password_hash, u.role_id, 
             u.storage_quota_gb, u.storage_used_gb, u.is_active, 
             u.created_at, u.updated_at,
             r.name as role_name, r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `);
    
    const row = stmt.get(id) as any;
    return row ? this.mapRowToUserWithRole(row) : null;
  }

  findAllWithRoles(): UserWithRole[] {
    const stmt = this.db.prepare(`
      SELECT u.id, u.username, u.email, u.password_hash, u.role_id, 
             u.storage_quota_gb, u.storage_used_gb, u.is_active, 
             u.created_at, u.updated_at,
             r.name as role_name, r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.username
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToUserWithRole);
  }

  create(userData: CreateUserData): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, role_id, storage_quota_gb)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userData.username,
      userData.email,
      userData.password_hash,
      userData.role_id,
      userData.storage_quota_gb || 10
    );

    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error('Failed to create user');
    }
    
    return created;
  }

  update(id: number, updateData: UpdateUserData): User | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    if (updateData.username !== undefined) {
      updates.push('username = ?');
      params.push(updateData.username);
    }
    if (updateData.email !== undefined) {
      updates.push('email = ?');
      params.push(updateData.email);
    }
    if (updateData.password_hash !== undefined) {
      updates.push('password_hash = ?');
      params.push(updateData.password_hash);
    }
    if (updateData.role_id !== undefined) {
      updates.push('role_id = ?');
      params.push(updateData.role_id);
    }
    if (updateData.storage_quota_gb !== undefined) {
      updates.push('storage_quota_gb = ?');
      params.push(updateData.storage_quota_gb);
    }
    if (updateData.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(updateData.is_active ? 1 : 0);
    }

    if (updates.length === 0) return existing;

    params.push(id);
    const stmt = this.db.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...params);
    return this.findById(id);
  }

  updateStorageUsage(id: number, storageUsedGb: number): boolean {
    const stmt = this.db.prepare(`
      UPDATE users SET storage_used_gb = ? WHERE id = ?
    `);
    
    const result = stmt.run(storageUsedGb, id);
    return result.changes > 0;
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as any;
    return result.count;
  }

  countActive(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const result = stmt.get() as any;
    return result.count;
  }

  getTotalStorageUsed(): number {
    const stmt = this.db.prepare('SELECT SUM(storage_used_gb) as total FROM users');
    const result = stmt.get() as any;
    return result.total || 0;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password_hash: row.password_hash,
      role_id: row.role_id,
      storage_quota_gb: row.storage_quota_gb,
      storage_used_gb: row.storage_used_gb,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private mapRowToUserWithRole(row: any): UserWithRole {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password_hash: row.password_hash,
      role_id: row.role_id,
      storage_quota_gb: row.storage_quota_gb,
      storage_used_gb: row.storage_used_gb,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
      role_name: row.role_name,
      role_permissions: JSON.parse(row.permissions)
    };
  }
}