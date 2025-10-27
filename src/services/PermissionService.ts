import { DatabaseSync } from 'node:sqlite';
import { DatabaseConnection } from '../database/connection.js';
import { PermissionRepository } from '../repositories/PermissionRepository.js';
import { Permission, CreatePermissionData, UpdatePermissionData } from '../models/Permission.js';

export class PermissionService {
  private db: DatabaseSync;
  private permissionRepo: PermissionRepository;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.permissionRepo = new PermissionRepository(this.db);
  }

  getAllPermissions(): Permission[] {
    return this.permissionRepo.findAll();
  }

  getPermissionById(id: number): Permission | null {
    return this.permissionRepo.findById(id);
  }

  getPermissionByName(name: string): Permission | null {
    return this.permissionRepo.findByName(name);
  }

  createPermission(data: CreatePermissionData): Permission {
    return this.permissionRepo.create(data);
  }

  updatePermission(id: number, data: UpdatePermissionData): Permission | null {
    return this.permissionRepo.update(id, data);
  }

  deletePermission(id: number): boolean {
    return this.permissionRepo.delete(id);
  }
}
