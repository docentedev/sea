export interface Role {
  id: number;
  name: string;
  display_name: string;
  /**
   * Permisos asociados al rol, obtenidos dinámicamente desde la tabla intermedia role_permissions.
   */
  permissions: string[];
  max_storage_gb: number;
  created_at: string;
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  /**
   * Permisos a vincular al rol, no se guardan en la tabla roles sino en role_permissions.
   */
  permissions: string[];
  max_storage_gb?: number;
}

export interface UpdateRoleData {
  display_name?: string;
  /**
   * Permisos a vincular al rol, no se guardan en la tabla roles sino en role_permissions.
   */
  permissions?: string[];
  max_storage_gb?: number;
}