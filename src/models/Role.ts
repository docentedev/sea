export interface Role {
  id: number;
  name: string;
  display_name: string;
  permissions: string[];
  can_share: boolean;
  can_admin: boolean;
  max_storage_gb: number;
  created_at: string;
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  permissions: string[];
  can_share?: boolean;
  can_admin?: boolean;
  max_storage_gb?: number;
}

export interface UpdateRoleData {
  display_name?: string;
  permissions?: string[];
  can_share?: boolean;
  can_admin?: boolean;
  max_storage_gb?: number;
}