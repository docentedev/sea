export interface Permission {
  id: number;
  name: string; // Ej: 'view_logs', 'manage_config', etc.
  description: string;
  created_at: string;
}

export interface CreatePermissionData {
  name: string;
  description: string;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
}
