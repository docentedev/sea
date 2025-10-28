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

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.roleRepo = new RoleRepository(this.db);
    this.userRepo = new UserRepository(this.db);
    this.configService = new ConfigurationService();
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
    this.db.exec(DB_SCHEMA.ROLE_PERMISSIONS_TABLE);
    this.db.exec(DB_SCHEMA.PERMISSIONS_TABLE);
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

  // Eliminado: migraciones y transformaciones. Solo estructura y datos iniciales.

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
      { name: 'admin', description: 'Permisos administrativos completos' },
      { name: 'can_share', description: 'Permite compartir archivos y carpetas' }
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
        let permissions: string[] = [];
        if (roleData.name === 'admin') {
          const allPermissions = this.db.prepare('SELECT name FROM permissions').all().map((p: any) => p.name);
          permissions = allPermissions;
        }
        this.roleRepo.create({
          name: roleData.name,
          display_name: roleData.display_name,
          permissions,
          max_storage_gb: roleData.max_storage_gb
        });
      }
      console.log('🌱 NAS Cloud database seeded with default roles and permissions');
    }

    // Configuraciones y usuarios iniciales
    this.seedDefaultConfigurations();
    this.seedInitialUsers();
  }

  private seedDefaultConfigurations(): void {
    // Configuración básica y rutas iniciales
    try {
      const uploadPath = this.configService.getConfigValue('upload_path');
      if (!uploadPath) {
        const defaultUploadPath = path.resolve(process.cwd(), 'uploads');
        if (!fs.existsSync(defaultUploadPath)) {
          fs.mkdirSync(defaultUploadPath, { recursive: true });
        }
        this.configService.setUploadPath(defaultUploadPath);
      }
      if (!this.configService.getConfigValue('allowed_file_types')) {
        this.configService.setConfigValue('allowed_file_types', 'image/*,application/pdf,text/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/x-guitar-pro,audio/x-gtp,application/octet-stream');
      }
      if (!this.configService.getConfigValue('blocked_file_extensions')) {
        this.configService.setConfigValue('blocked_file_extensions', '.exe,.bat,.cmd,.com,.scr,.pif,.jar,.py,.pyc,.pyo,.pyd');
      }
      if (!this.configService.getConfigValue('allowed_file_extensions')) {
        this.configService.setConfigValue('allowed_file_extensions', '.pdf,.doc,.docx,.txt,.jpg,.png,.jpeg,.gif,.mp3,.wav,.gp,.gp3,.gp4,.gp5,.gpx,.gpz');
      }
      if (!this.configService.getConfigValue('default_file_view')) {
        this.configService.setConfigValue('default_file_view', 'list');
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