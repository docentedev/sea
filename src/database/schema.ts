export const DB_SCHEMA = {
  ROLES_TABLE: `
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      permissions TEXT NOT NULL,
      can_share INTEGER DEFAULT 0,
      can_admin INTEGER DEFAULT 0,
      max_storage_gb INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  
  USERS_TABLE: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      storage_quota_gb INTEGER DEFAULT 10,
      storage_used_gb REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    )
  `,

  USERS_TRIGGER: `
    CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `,

  CONFIGURATIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS configurations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  CONFIGURATIONS_TRIGGER: `
    CREATE TRIGGER IF NOT EXISTS update_configurations_timestamp 
    AFTER UPDATE ON configurations
    BEGIN
      UPDATE configurations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `,

  FILES_TABLE: `
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      path TEXT NOT NULL,
      size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      folder_path TEXT NOT NULL,
      virtual_folder_path TEXT DEFAULT '/',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,

  FILES_TRIGGER: `
    CREATE TRIGGER IF NOT EXISTS update_files_timestamp 
    AFTER UPDATE ON files
    BEGIN
      UPDATE files SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `,

  FOLDERS_TABLE: `
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT UNIQUE NOT NULL,
      parent_path TEXT,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,

  FOLDERS_TRIGGER: `
    CREATE TRIGGER IF NOT EXISTS update_folders_timestamp 
    AFTER UPDATE ON folders
    BEGIN
      UPDATE folders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `
};

export const DEFAULT_ROLES = [
  {
    name: 'admin',
    display_name: 'Administrator',
    permissions: JSON.stringify(['read', 'write', 'delete', 'admin', 'share']),
    can_share: 1,
    can_admin: 1,
    max_storage_gb: 1000
  },
  {
    name: 'user',
    display_name: 'User',
    permissions: JSON.stringify(['read', 'write', 'share']),
    can_share: 1,
    can_admin: 0,
    max_storage_gb: 50
  },
  {
    name: 'guest',
    display_name: 'Guest',
    permissions: JSON.stringify(['read']),
    can_share: 0,
    can_admin: 0,
    max_storage_gb: 5
  }
];

export const DEFAULT_USERS = [
  // Users are now loaded from nas-cloud-config.json
  // This array is kept for backward compatibility but should be empty
];