import { FolderRepository } from '../repositories/FolderRepository';
import { FileRepository } from '../repositories/FileRepository';
import { Folder, CreateFolderData, UpdateFolderData, FolderContent } from '../models/Folder';
import { DatabaseSync } from 'node:sqlite';

export class VirtualFolderService {
  constructor(
    private folderRepo: FolderRepository,
    private fileRepo: FileRepository,
    private db: DatabaseSync
  ) {}

  async createFolder(data: CreateFolderData): Promise<Folder> {
    // Validate folder name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Folder name cannot be empty');
    }

    if (data.name.includes('/') || data.name.includes('\\')) {
      throw new Error('Folder name cannot contain path separators');
    }

    // Normalize parent_path: null or '/' both mean root
    const normalizedParentPath = (data.parent_path === '/' || data.parent_path === null) ? null : data.parent_path;

    // Check if folder already exists at this path
    const existingFolder = await this.folderRepo.findByPath(data.path);
    if (existingFolder) {
      throw new Error('Folder already exists at this path');
    }

    // Validate parent path exists if provided
    if (normalizedParentPath && normalizedParentPath !== '/') {
      const parentFolder = await this.folderRepo.findByPath(normalizedParentPath);
      if (!parentFolder) {
        throw new Error('Parent folder does not exist');
      }
    }

    return await this.folderRepo.create({
      ...data,
      parent_path: normalizedParentPath
    });
  }

  async getFolderById(id: number): Promise<Folder | null> {
    return await this.folderRepo.findById(id);
  }

  async getFolderByPath(path: string): Promise<Folder | null> {
    return await this.folderRepo.findByPath(path);
  }

  async getUserFolders(userId: number): Promise<Folder[]> {
    return await this.folderRepo.findByUserId(userId);
  }

  async getFolderContents(folderPath: string | null, userId?: number): Promise<FolderContent> {
    // Normalize folderPath: '/' and null both mean root
    const normalizedFolderPath = (folderPath === '/' || folderPath === null) ? null : folderPath;

    // Validate that the folder exists if path is provided
    if (normalizedFolderPath && normalizedFolderPath !== '/') {
      const folder = await this.folderRepo.findByPath(normalizedFolderPath);
      if (!folder) {
        throw new Error('Folder not found');
      }
    }

    return await this.folderRepo.getFolderContents(normalizedFolderPath, userId);
  }

  async updateFolder(id: number, data: UpdateFolderData): Promise<Folder | null> {
    const existingFolder = await this.folderRepo.findById(id);
    if (!existingFolder) {
      throw new Error('Folder not found');
    }

    // Validate new name if provided
    if (data.name) {
      if (data.name.trim().length === 0) {
        throw new Error('Folder name cannot be empty');
      }
      if (data.name.includes('/') || data.name.includes('\\')) {
        throw new Error('Folder name cannot contain path separators');
      }
    }

    // Check if new path conflicts if provided
    if (data.path && data.path !== existingFolder.path) {
      const conflictingFolder = await this.folderRepo.findByPath(data.path);
      if (conflictingFolder && conflictingFolder.id !== id) {
        throw new Error('Another folder already exists at this path');
      }
    }

    return await this.folderRepo.update(id, data);
  }

  async deleteFolder(id: number): Promise<boolean> {
    const folder = await this.folderRepo.findById(id);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // Check if folder has subfolders
    const subfolders = await this.folderRepo.findByParentPath(folder.path, folder.user_id);
    if (subfolders.length > 0) {
      throw new Error('Cannot delete folder with subfolders. Delete subfolders first.');
    }

    // Check if folder has files
    const filesResult = await this.fileRepo.findByFolderPath(folder.path, 1, 1000);
    if (filesResult.files.length > 0) {
      throw new Error('Cannot delete folder with files. Delete or move files first.');
    }

    return await this.folderRepo.delete(id);
  }

  async deleteFolderByPath(path: string): Promise<boolean> {
    const folder = await this.folderRepo.findByPath(path);
    if (!folder) {
      throw new Error('Folder not found');
    }

    return await this.deleteFolder(folder.id);
  }

  async moveFolder(id: number, newParentPath: string | null): Promise<Folder | null> {
    const folder = await this.folderRepo.findById(id);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // Validate new parent exists if provided
    if (newParentPath && newParentPath !== '/') {
      const parentFolder = await this.folderRepo.findByPath(newParentPath);
      if (!parentFolder) {
        throw new Error('New parent folder does not exist');
      }
    }

    // Build new path
    const newPath = newParentPath && newParentPath !== '/'
      ? `${newParentPath}/${folder.name}`
      : `/${folder.name}`;

    // Check for path conflicts
    const existingFolder = await this.folderRepo.findByPath(newPath);
    if (existingFolder && existingFolder.id !== id) {
      throw new Error('A folder with this name already exists in the destination');
    }

    // Update folder path and parent_path
    const updateData: UpdateFolderData = {
      path: newPath
    };

    return await this.folderRepo.update(id, updateData);
  }

  async getPathHierarchy(userId: number): Promise<Folder[]> {
    return await this.folderRepo.getPathHierarchy(userId);
  }

  async createFolderPath(fullPath: string, userId: number): Promise<Folder> {
    const pathParts = fullPath.split('/').filter(part => part.length > 0);

    let currentPath = '';
    let parentPath: string | null = null;

    for (let i = 0; i < pathParts.length; i++) {
      const folderName = pathParts[i];
      currentPath += `/${folderName}`;

      let folder = await this.folderRepo.findByPath(currentPath);

      if (!folder) {
        // Create the folder
        const createData: CreateFolderData = {
          name: folderName,
          path: currentPath,
          parent_path: parentPath,
          user_id: userId
        };

        folder = await this.folderRepo.create(createData);
      }

      parentPath = currentPath;
    }

    const finalFolder = await this.folderRepo.findByPath(currentPath);
    if (!finalFolder) {
      throw new Error('Failed to create folder path');
    }

    return finalFolder;
  }

  async ensureFolderExists(folderPath: string, userId: number): Promise<Folder> {
    if (folderPath === '/' || !folderPath) {
      throw new Error('Root folder always exists');
    }

    let folder = await this.folderRepo.findByPath(folderPath);
    if (folder) {
      return folder;
    }

    return await this.createFolderPath(folderPath, userId);
  }
}