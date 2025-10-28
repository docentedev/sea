import { DatabaseSync } from 'node:sqlite';

export class RolePermissionRepository {
  constructor(private db: DatabaseSync) {}

  addPermissionToRole(roleId: number, permissionId: number): void {
    this.db.prepare(`
      INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)
    `).run(roleId, permissionId);
  }

  removePermissionFromRole(roleId: number, permissionId: number): void {
    this.db.prepare(`
      DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?
    `).run(roleId, permissionId);
  }

  getPermissionsForRole(roleId: number): number[] {
    const rows = this.db.prepare(`
      SELECT permission_id FROM role_permissions WHERE role_id = ?
    `).all(roleId) as any[];
    return rows.map(r => r.permission_id);
  }

  setPermissionsForRole(roleId: number, permissionIds: number[]): void {
    this.db.prepare(`DELETE FROM role_permissions WHERE role_id = ?`).run(roleId);
    permissionIds.forEach(pid => {
      this.addPermissionToRole(roleId, pid);
    });
  }
}
