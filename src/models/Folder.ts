export interface Folder {
  id: number;
  name: string;
  path: string; // ruta completa de la carpeta (ej: "/documents/work")
  parent_path: string | null; // ruta del padre (ej: "/documents") o null para root
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderData {
  name: string;
  path: string;
  parent_path: string | null;
  user_id: number;
}

export interface UpdateFolderData {
  name?: string;
  path?: string;
}

export interface FolderContent {
  folders: Folder[];
  files: import('./File').File[];
  current_path: string;
  parent_path: string | null;
}