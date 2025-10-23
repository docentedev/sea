import { DatabaseSync } from 'node:sqlite';
import { DatabaseConnection } from '../database/connection.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { RoleRepository } from '../repositories/RoleRepository.js';
import { User, CreateUserData, UpdateUserData, UserWithRole } from '../models/User.js';

export class UserService {
  private db: DatabaseSync;
  private userRepo: UserRepository;
  private roleRepo: RoleRepository;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.userRepo = new UserRepository(this.db);
    this.roleRepo = new RoleRepository(this.db);
  }

  // User management
  getAllUsers(): User[] {
    return this.userRepo.findAll();
  }

  getActiveUsers(): User[] {
    return this.userRepo.findActive();
  }

  getUserById(id: number): User | null {
    return this.userRepo.findById(id);
  }

  getUserByUsername(username: string): User | null {
    return this.userRepo.findByUsername(username);
  }

  getUserWithRole(id: number): UserWithRole | null {
    return this.userRepo.findWithRole(id);
  }

  getAllUsersWithRoles(): UserWithRole[] {
    return this.userRepo.findAllWithRoles();
  }

  createUser(userData: CreateUserData): User {
    // Validate role exists
    const role = this.roleRepo.findById(userData.role_id);
    if (!role) {
      throw new Error(`Role with ID ${userData.role_id} not found`);
    }

    // Check if username or email already exists
    if (this.userRepo.findByUsername(userData.username)) {
      throw new Error(`Username '${userData.username}' already exists`);
    }

    if (this.userRepo.findByEmail(userData.email)) {
      throw new Error(`Email '${userData.email}' already exists`);
    }

    // Set default storage quota based on role if not provided
    if (!userData.storage_quota_gb) {
      userData.storage_quota_gb = role.max_storage_gb;
    }

    return this.userRepo.create(userData);
  }

  updateUser(id: number, updateData: UpdateUserData): User | null {
    // If updating role, validate it exists
    if (updateData.role_id) {
      const role = this.roleRepo.findById(updateData.role_id);
      if (!role) {
        throw new Error(`Role with ID ${updateData.role_id} not found`);
      }
    }

    // Check for username/email conflicts if updating
    if (updateData.username) {
      const existing = this.userRepo.findByUsername(updateData.username);
      if (existing && existing.id !== id) {
        throw new Error(`Username '${updateData.username}' already exists`);
      }
    }

    if (updateData.email) {
      const existing = this.userRepo.findByEmail(updateData.email);
      if (existing && existing.id !== id) {
        throw new Error(`Email '${updateData.email}' already exists`);
      }
    }

    return this.userRepo.update(id, updateData);
  }

  deleteUser(id: number): boolean {
    return this.userRepo.delete(id);
  }

  updateStorageUsage(id: number, storageUsedGb: number): boolean {
    return this.userRepo.updateStorageUsage(id, storageUsedGb);
  }

  // Authentication helper
  authenticate(username: string, password: string): UserWithRole | null {
    const user = this.userRepo.findByUsername(username);
    if (!user || !user.is_active) {
      return null;
    }

    // En producción, usar bcrypt.compare()
    if (user.password_hash !== password) {
      return null;
    }

    return this.userRepo.findWithRole(user.id);
  }

  // Storage management
  checkStorageQuota(userId: number, additionalGb: number): boolean {
    const user = this.userRepo.findById(userId);
    if (!user) return false;

    return (user.storage_used_gb + additionalGb) <= user.storage_quota_gb;
  }

  getUserStorageInfo(userId: number): { used: number; quota: number; available: number } | null {
    const user = this.userRepo.findById(userId);
    if (!user) return null;

    return {
      used: user.storage_used_gb,
      quota: user.storage_quota_gb,
      available: user.storage_quota_gb - user.storage_used_gb
    };
  }
}