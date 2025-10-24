import { DatabaseStats } from '../models/DatabaseStats.js';
import { DatabaseConnection } from '../database/connection.js';
import { DatabaseInitializer } from '../database/initializer.js';
import { UserService } from './UserService.js';
import { RoleService } from './RoleService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { RoleRepository } from '../repositories/RoleRepository.js';
import { DatabaseSync } from 'node:sqlite';
import { statSync } from 'fs';

/**
 * Main Database Service - Simplified and clean
 * Coordinates between repositories and business services
 */
export class DatabaseService {
  private db: DatabaseSync;
  private userService: UserService;
  private roleService: RoleService;
  private userRepo: UserRepository;
  private roleRepo: RoleRepository;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.userService = new UserService();
    this.roleService = new RoleService();
    this.userRepo = new UserRepository(this.db);
    this.roleRepo = new RoleRepository(this.db);
    this.initialize();
  }

  private initialize(): void {
    const initializer = new DatabaseInitializer();
    initializer.initialize();
  }

  // Service accessors
  getUserService(): UserService {
    return this.userService;
  }

  getRoleService(): RoleService {
    return this.roleService;
  }

  getDatabase(): DatabaseSync {
    return this.db;
  }

  // Health and statistics
  getHealth(): { status: string; message: string } {
    try {
      // Test database connection
      this.db.prepare('SELECT 1').get();
      return { status: 'healthy', message: 'Database connection is working' };
    } catch (error) {
      return { status: 'unhealthy', message: `Database error: ${error}` };
    }
  }

  getStats(): DatabaseStats {
    try {
      const stats: DatabaseStats = {
        total_users: this.userRepo.count(),
        active_users: this.userRepo.countActive(),
        total_roles: this.roleRepo.findAll().length,
        total_storage_used_gb: this.userRepo.getTotalStorageUsed(),
        database_size_mb: this.getDatabaseSizeMB()
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error}`);
    }
  }

  private getDatabaseSizeMB(): number {
    try {
      const stats = statSync(DatabaseConnection.getDbPath());
      return Math.round((stats.size / (1024 * 1024)) * 100) / 100;
    } catch {
      return 0;
    }
  }

  // Cleanup
  close(): void {
    DatabaseConnection.close();
  }
}