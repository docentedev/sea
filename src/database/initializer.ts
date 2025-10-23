import { DatabaseSync } from 'node:sqlite';
import { DatabaseConnection } from './connection.js';
import { DB_SCHEMA, DEFAULT_ROLES, DEFAULT_USERS } from './schema.js';
import { RoleRepository } from '../repositories/RoleRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

export class DatabaseInitializer {
  private db: DatabaseSync;
  private roleRepo: RoleRepository;
  private userRepo: UserRepository;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.roleRepo = new RoleRepository(this.db);
    this.userRepo = new UserRepository(this.db);
  }

  initialize(): void {
    try {
      this.createTables();
      this.seedDatabase();
      console.log(`📁 NAS Cloud Database initialized at: ${DatabaseConnection.getDbPath()}`);
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  private createTables(): void {
    this.db.exec(DB_SCHEMA.ROLES_TABLE);
    this.db.exec(DB_SCHEMA.USERS_TABLE);
    this.db.exec(DB_SCHEMA.USERS_TRIGGER);
  }

  private seedDatabase(): void {
    const existingRoles = this.roleRepo.findAll();
    
    if (existingRoles.length === 0) {
      // Seed roles
      for (const roleData of DEFAULT_ROLES) {
        this.roleRepo.create({
          name: roleData.name,
          display_name: roleData.display_name,
          permissions: JSON.parse(roleData.permissions),
          can_share: Boolean(roleData.can_share),
          can_admin: Boolean(roleData.can_admin),
          max_storage_gb: roleData.max_storage_gb
        });
      }

      // Seed users
      for (const userData of DEFAULT_USERS) {
        this.userRepo.create(userData);
      }

      console.log('🌱 NAS Cloud database seeded with default roles and users');
      console.log('👤 Default users:');
      console.log('   - admin / admin123 (Administrator)');
      console.log('   - demo_user / user123 (User)');
      console.log('   - guest / guest123 (Guest)');
    }
  }
}