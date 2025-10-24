export interface File {
  id: number;
  filename: string;
  original_filename: string;
  path: string;
  size: number;
  mime_type: string;
  user_id: number;
  folder_path: string;
  virtual_folder_path: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFileData {
  filename: string;
  original_filename: string;
  path: string;
  size: number;
  mime_type: string;
  user_id: number;
  folder_path: string;
  virtual_folder_path?: string;
}

export interface UpdateFileData {
  filename?: string;
  original_filename?: string;
  path?: string;
  size?: number;
  mime_type?: string;
  folder_path?: string;
  virtual_folder_path?: string;
}

export interface FileUploadResult {
  file: File;
  url: string;
}

export interface FileListResult {
  files: File[];
  total: number;
  page: number;
  limit: number;
}