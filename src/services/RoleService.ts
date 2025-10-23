import { DatabaseSync } from 'node:sqlite';
import { DatabaseConnection } from '../database/connection.js';
import { RoleRepository } from '../repositories/RoleRepository.js';
import { Role, CreateRoleData, UpdateRoleData } from '../models/Role.js';

export class RoleService {
  private db: DatabaseSync;
  private roleRepo: RoleRepository;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.roleRepo = new RoleRepository(this.db);
  }

  getAllRoles(): Role[] {
    return this.roleRepo.findAll();
  }

  getRoleById(id: number): Role | null {
    return this.roleRepo.findById(id);
  }

  getRoleByName(name: string): Role | null {
    return this.roleRepo.findByName(name);
  }

  createRole(roleData: CreateRoleData): Role {
    // Check if role name already exists
    if (this.roleRepo.findByName(roleData.name)) {
      throw new Error(`Role with name '${roleData.name}' already exists`);
    }

    // Validate permissions
    this.validatePermissions(roleData.permissions);

    return this.roleRepo.create(roleData);
  }

  updateRole(id: number, updateData: UpdateRoleData): Role | null {
    if (updateData.permissions) {
      this.validatePermissions(updateData.permissions);
    }

    return this.roleRepo.update(id, updateData);
  }

  deleteRole(id: number): boolean {
    // Check if role is in use by any users
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE role_id = ?');
    const result = stmt.get(id) as any;
    
    if (result.count > 0) {
      throw new Error(`Cannot delete role: ${result.count} users are assigned to this role`);
    }

    return this.roleRepo.delete(id);
  }

  // Permission management
  private validatePermissions(permissions: string[]): void {
    const validPermissions = ['read', 'write', 'delete', 'admin', 'share'];
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }
  }

  hasPermission(roleId: number, permission: string): boolean {
    const role = this.roleRepo.findById(roleId);
    if (!role) return false;

    return role.permissions.includes(permission);
  }

  canShare(roleId: number): boolean {
    const role = this.roleRepo.findById(roleId);
    return role?.can_share || false;
  }

  canAdmin(roleId: number): boolean {
    const role = this.roleRepo.findById(roleId);
    return role?.can_admin || false;
  }
}