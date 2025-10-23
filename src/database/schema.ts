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
  {
    username: 'admin',
    email: 'admin@nas-cloud.local',
    password_hash: 'admin123', // En producción usar bcrypt
    role_id: 1,
    storage_quota_gb: 1000
  },
  {
    username: 'demo_user',
    email: 'user@nas-cloud.local',
    password_hash: 'user123',
    role_id: 2,
    storage_quota_gb: 50
  },
  {
    username: 'guest',
    email: 'guest@nas-cloud.local',
    password_hash: 'guest123',
    role_id: 3,
    storage_quota_gb: 5
  }
];