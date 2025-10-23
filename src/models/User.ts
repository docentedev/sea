export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role_id: number;
  storage_quota_gb: number;
  storage_used_gb: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password_hash: string;
  role_id: number;
  storage_quota_gb?: number;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password_hash?: string;
  role_id?: number;
  storage_quota_gb?: number;
  is_active?: boolean;
}

export interface UserWithRole extends User {
  role_name: string;
  role_permissions: string[];
}