import { DatabaseSync } from 'node:sqlite';
import { DatabaseConnection } from './connection.js';
import { DB_SCHEMA, DEFAULT_ROLES } from './schema.js';
import { RoleRepository } from '../repositories/RoleRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { ConfigurationService } from '../services/ConfigurationService.js';
import { usersConfig } from '../config/index.js';
import * as path from 'node:path';
import * as fs from 'node:fs';

export class DatabaseInitializer {
  private db: DatabaseSync;
  private roleRepo: RoleRepository;
  private userRepo: UserRepository;
  private configService: ConfigurationService;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.roleRepo = new RoleRepository(this.db);
    this.userRepo = new UserRepository(this.db);
    this.configService = new ConfigurationService();
  }

  initialize(): void {
    try {
      this.createTables();
      this.migrateTables();
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
    this.db.exec(DB_SCHEMA.CONFIGURATIONS_TABLE);
    this.db.exec(DB_SCHEMA.CONFIGURATIONS_TRIGGER);
    this.db.exec(DB_SCHEMA.FILES_TABLE);
    this.db.exec(DB_SCHEMA.FILES_TRIGGER);
    this.db.exec(DB_SCHEMA.FOLDERS_TABLE);
    this.db.exec(DB_SCHEMA.FOLDERS_TRIGGER);
  }

  private migrateTables(): void {
    // Check and add missing columns
    this.addMissingColumns();
    
    // Migrate old path references from 'home' to '/'
    this.migratePaths();
  }

  private addMissingColumns(): void {
    // Check if virtual_folder_path column exists in files table
    const tableInfo = this.db.prepare('PRAGMA table_info(files)').all() as any[];
    const hasVirtualFolderPath = tableInfo.some(col => col.name === 'virtual_folder_path');

    if (!hasVirtualFolderPath) {
      this.db.exec('ALTER TABLE files ADD COLUMN virtual_folder_path TEXT DEFAULT "/"');
      console.log('🔧 Added missing virtual_folder_path column to files table');
    }
  }

  private migratePaths(): void {
    try {
      // Update files table: change virtual_folder_path from 'home' or '/home' to '/'
      const filesUpdated = this.db.prepare(`
        UPDATE files 
        SET virtual_folder_path = '/' 
        WHERE virtual_folder_path IN ('home', '/home')
      `).run();

      if (filesUpdated.changes > 0) {
        console.log(`🔄 Migrated ${filesUpdated.changes} files from 'home' path to '/'`);
      }

      // Update folders table: change path from '/home' to '/'
      const foldersPathUpdated = this.db.prepare(`
        UPDATE folders 
        SET path = REPLACE(path, '/home', '/')
        WHERE path LIKE '/home%'
      `).run();

      if (foldersPathUpdated.changes > 0) {
        console.log(`🔄 Migrated ${foldersPathUpdated.changes} folder paths from '/home' to '/'`);
      }

      // Update folders table: change parent_path from '/home' to '/'
      const foldersParentUpdated = this.db.prepare(`
        UPDATE folders 
        SET parent_path = REPLACE(parent_path, '/home', '/')
        WHERE parent_path LIKE '/home%'
      `).run();

      if (foldersParentUpdated.changes > 0) {
        console.log(`🔄 Migrated ${foldersParentUpdated.changes} folder parent paths from '/home' to '/'`);
      }

      // Also handle cases where parent_path is just 'home'
      const foldersParentHomeUpdated = this.db.prepare(`
        UPDATE folders 
        SET parent_path = '/'
        WHERE parent_path = 'home'
      `).run();

      if (foldersParentHomeUpdated.changes > 0) {
        console.log(`🔄 Migrated ${foldersParentHomeUpdated.changes} folder parent paths from 'home' to '/'`);
      }

    } catch (error) {
      console.error('❌ Error during path migration:', error);
    }
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
      console.log('🌱 NAS Cloud database seeded with default roles');
    }

    // Seed default configurations
    this.seedDefaultConfigurations();

    // Seed initial users from config
    this.seedInitialUsers();
  }

  private seedDefaultConfigurations(): void {
    try {
      // Set default upload path if not exists
      const uploadPath = this.configService.getConfigValue('upload_path');
      if (!uploadPath) {
        // Use absolute path to uploads directory in project root
        const defaultUploadPath = path.resolve(process.cwd(), 'uploads');
        
        // Ensure uploads directory exists
        if (!fs.existsSync(defaultUploadPath)) {
          fs.mkdirSync(defaultUploadPath, { recursive: true });
          console.log(`📁 Created uploads directory: ${defaultUploadPath}`);
        }
        
        this.configService.setUploadPath(defaultUploadPath);
        console.log(`📁 Default upload path set to: ${defaultUploadPath}`);
      }
    } catch (error) {
      console.error('❌ Error seeding default configurations:', error);
    }
  }

  private seedInitialUsers(): void {
    const roles = this.roleRepo.findAll();
    const roleMap = new Map(roles.map(role => [role.name, role.id]));

    let usersCreated = 0;
    let usersUpdated = 0;

    for (const userConfig of usersConfig.initialUsers) {
      try {
        const existingUser = this.userRepo.findByUsername(userConfig.username);
        const roleId = roleMap.get(userConfig.role);

        if (!roleId) {
          console.warn(`⚠️  Role '${userConfig.role}' not found for user '${userConfig.username}', skipping...`);
          continue;
        }

        if (!existingUser) {
          // Crear usuario si no existe
          this.userRepo.create({
            username: userConfig.username,
            email: userConfig.email,
            password_hash: userConfig.password, // En producción usar bcrypt
            role_id: roleId,
            storage_quota_gb: userConfig.storageQuotaGb
          });
          usersCreated++;
          console.log(`👤 Created user: ${userConfig.username} (${userConfig.role})`);
        } else if (userConfig.forceUpdate || usersConfig.forceCreateInitial) {
          // Actualizar usuario si existe y se fuerza la actualización
          this.userRepo.update(existingUser.id, {
            email: userConfig.email,
            password_hash: userConfig.password,
            role_id: roleId,
            storage_quota_gb: userConfig.storageQuotaGb
          });
          usersUpdated++;
          console.log(`🔄 Updated user: ${userConfig.username} (${userConfig.role})`);
        }
      } catch (error) {
        console.error(`❌ Error processing user ${userConfig.username}:`, error);
      }
    }

    if (usersCreated > 0 || usersUpdated > 0) {
      console.log(`✅ Initial users processed: ${usersCreated} created, ${usersUpdated} updated`);
    }
  }
}