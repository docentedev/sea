  export const DB_SCHEMA = {
    SHARED_LINKS_TABLE: `
      CREATE TABLE IF NOT EXISTS shared_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id INTEGER NOT NULL,
        user_id INTEGER,
        token TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        expires_at DATETIME,
        max_access_count INTEGER,
        access_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME,
        revoked INTEGER DEFAULT 0,
        FOREIGN KEY (file_id) REFERENCES files(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `,
  ROLE_PERMISSIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    )
  `,
  PERMISSIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ROLES_TABLE: `
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
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
      user_id INTEGER,
      folder_path TEXT NOT NULL,
      virtual_folder_path TEXT DEFAULT '/',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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
    max_storage_gb: 1000
  },
  {
    name: 'user',
    display_name: 'User',
    max_storage_gb: 50
  },
  {
    name: 'guest',
    display_name: 'Guest',
    max_storage_gb: 5
  }
];

export const DEFAULT_USERS = [
  // Users are now loaded from nas-cloud-config.json
  // This array is kept for backward compatibility but should be empty
];