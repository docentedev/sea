import { DatabaseSync } from 'node:sqlite';
import { DatabaseConnection } from '../database/connection.js';
import { RolePermissionRepository } from '../repositories/RolePermissionRepository.js';

export class RolePermissionService {
  private db: DatabaseSync;
  private repo: RolePermissionRepository;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.repo = new RolePermissionRepository(this.db);
  }

  addPermissionToRole(roleId: number, permissionId: number): void {
    this.repo.addPermissionToRole(roleId, permissionId);
  }

  removePermissionFromRole(roleId: number, permissionId: number): void {
    this.repo.removePermissionFromRole(roleId, permissionId);
  }

  getPermissionsForRole(roleId: number): number[] {
    return this.repo.getPermissionsForRole(roleId);
  }

  setPermissionsForRole(roleId: number, permissionIds: number[]): void {
    this.repo.setPermissionsForRole(roleId, permissionIds);
  }
}
