import { DatabaseSync } from 'node:sqlite';
import { DatabaseConnection } from './connection.js';
import { DB_SCHEMA, DEFAULT_ROLES } from './schema.js';
import { DatabaseMigration } from './migration.js';
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
  private migration: DatabaseMigration;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.roleRepo = new RoleRepository(this.db);
    this.userRepo = new UserRepository(this.db);
    this.configService = new ConfigurationService();
    this.migration = new DatabaseMigration(this.db);
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
    // Migración automática: crear tabla de permisos si no existe
    try {
      this.db.exec(DB_SCHEMA.PERMISSIONS_TABLE);
    } catch (err) {
      console.error('❌ Error creando tabla de permisos:', err);
    }
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
    // Migrate to nullable user_id with ON DELETE SET NULL
    this.migration.migrateToNullableUserId();

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
    // Permisos iniciales sugeridos
    const initialPermissions = [
      { name: 'view_logs', description: 'Ver registros de actividad' },
      { name: 'manage_logs', description: 'Gestionar y eliminar registros' },
      { name: 'view_config', description: 'Ver configuraciones del sistema' },
      { name: 'manage_config', description: 'Modificar configuraciones del sistema' },
      { name: 'view_files', description: 'Ver archivos y carpetas' },
      { name: 'manage_files', description: 'Subir, modificar y eliminar archivos' },
      { name: 'view_roles', description: 'Ver roles y permisos' },
      { name: 'manage_roles', description: 'Crear, modificar y eliminar roles' },
      { name: 'view_users', description: 'Ver usuarios' },
      { name: 'manage_users', description: 'Crear, modificar y eliminar usuarios' },
      { name: 'admin', description: 'Permisos administrativos completos' }
    ];
    const db = this.db;
    initialPermissions.forEach(p => {
      const exists = db.prepare('SELECT 1 FROM permissions WHERE name = ?').get(p.name);
      if (!exists) {
        db.prepare('INSERT INTO permissions (name, description) VALUES (?, ?)').run(p.name, p.description);
      }
    });
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

      // Set default allowed file types if not exists
      const allowedFileTypes = this.configService.getConfigValue('allowed_file_types');
      if (!allowedFileTypes) {
        const defaultAllowedTypes = 'image/*,application/pdf,text/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/x-guitar-pro,audio/x-gtp,application/octet-stream';
        this.configService.setConfigValue('allowed_file_types', defaultAllowedTypes);
        console.log(`📄 Default allowed file types set`);
      }

      // Set default blocked file extensions if not exists
      const blockedExtensions = this.configService.getConfigValue('blocked_file_extensions');
      if (!blockedExtensions) {
        const defaultBlockedExtensions = '.exe,.bat,.cmd,.com,.scr,.pif,.jar,.py,.pyc,.pyo,.pyd';
        this.configService.setConfigValue('blocked_file_extensions', defaultBlockedExtensions);
        console.log(`🚫 Default blocked file extensions set`);
      }

      // Set default allowed file extensions if not exists (empty by default - optional whitelist)
      const allowedFileExtensions = this.configService.getConfigValue('allowed_file_extensions');
      if (!allowedFileExtensions || allowedFileExtensions.trim() === '') {
        const defaultAllowedExtensions = '.pdf,.doc,.docx,.txt,.jpg,.png,.jpeg,.gif,.mp3,.wav,.gp,.gp3,.gp4,.gp5,.gpx,.gpz'; // Common file extensions including Guitar Pro formats
        this.configService.setConfigValue('allowed_file_extensions', defaultAllowedExtensions);
        console.log(`✅ Default allowed file extensions set (whitelist with common formats)`);
      } else {
        // Check if .gp3 is missing and add it if needed
        const extensions = allowedFileExtensions.split(',').map(ext => ext.trim());
        const guitarProExtensions = ['.gp3', '.gp4', '.gp5', '.gpx', '.gpz'];
        let updated = false;
        
        for (const gpExt of guitarProExtensions) {
          if (!extensions.includes(gpExt)) {
            extensions.push(gpExt);
            updated = true;
          }
        }
        
        if (updated) {
          const newExtensions = extensions.join(',');
          this.configService.setConfigValue('allowed_file_extensions', newExtensions);
          console.log(`🔧 Updated allowed file extensions to include Guitar Pro formats: ${newExtensions}`);
        }
      }

      // Set default file view mode if not exists
      const defaultFileView = this.configService.getConfigValue('default_file_view');
      if (!defaultFileView) {
        this.configService.setConfigValue('default_file_view', 'list');
        console.log(`👁️ Default file view mode set to 'list'`);
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