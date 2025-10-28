export interface SharedLink {
  id: number;
  file_id: number;
  user_id?: number;
  token: string;
  password_hash?: string;
  expires_at?: string;
  max_access_count?: number;
  access_count: number;
  created_at: string;
  last_accessed?: string;
  revoked: boolean;
}

export interface CreateSharedLinkData {
  file_id: number;
  user_id?: number;
  password?: string;
  expires_at?: string;
  max_access_count?: number;
}
