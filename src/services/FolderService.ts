import { ConfigurationService } from './ConfigurationService.js';
import { FileService } from './FileService.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface FolderInfo {
  name: string;
  path: string;
  created: Date;
  fileCount: number;
  totalSize: number;
}

export class FolderService {
  private configService: ConfigurationService;
  private fileService: FileService;

  constructor() {
    this.configService = new ConfigurationService();
    this.fileService = new FileService();
  }

  // Folder creation
  async createFolder(folderName: string, parentPath: string = ''): Promise<string> {
    if (!folderName || folderName.trim().length === 0) {
      throw new Error('Folder name is required');
    }

    // Validate folder name (no special characters that could cause issues)
    if (/[<>:"/\\|?*]/.test(folderName)) {
      throw new Error('Folder name contains invalid characters');
    }

    const basePath = this.configService.getUploadPath();
    const fullPath = parentPath
      ? path.join(basePath, parentPath, folderName)
      : path.join(basePath, folderName);

    // Check if folder already exists
    if (fs.existsSync(fullPath)) {
      throw new Error('Folder already exists');
    }

    await this.fileService.createFolder(fullPath);
    return fullPath;
  }

  // Folder deletion (recursive)
  async deleteFolder(folderPath: string): Promise<boolean> {
    if (!folderPath || folderPath.trim().length === 0) {
      throw new Error('Folder path is required');
    }

    const basePath = this.configService.getUploadPath();
    const fullPath = path.join(basePath, folderPath);

    // Prevent deletion of root upload directory
    if (fullPath === basePath) {
      throw new Error('Cannot delete root upload directory');
    }

    return this.fileService.deleteFolder(folderPath);
  }

  // List folders
  listFolders(parentPath: string = ''): FolderInfo[] {
    try {
      const basePath = this.configService.getUploadPath();
      const targetPath = parentPath ? path.join(basePath, parentPath) : basePath;

      if (!fs.existsSync(targetPath)) {
        return [];
      }

      const items = fs.readdirSync(targetPath);
      const folders: FolderInfo[] = [];

      for (const item of items) {
        const itemPath = path.join(targetPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          const relativePath = parentPath ? path.join(parentPath, item) : item;
          const folderInfo = this.getFolderInfo(relativePath);
          folders.push(folderInfo);
        }
      }

      return folders;
    } catch (error) {
      console.error('Error listing folders:', error);
      return [];
    }
  }

  // Get folder information
  getFolderInfo(folderPath: string): FolderInfo {
    const basePath = this.configService.getUploadPath();
    const fullPath = path.join(basePath, folderPath);

    try {
      const stat = fs.statSync(fullPath);
      const files = this.fileService.getFilesByFolder(folderPath, 1, 1000); // Get all files

      const totalSize = files.files.reduce((sum, file) => sum + file.size, 0);

      return {
        name: path.basename(folderPath),
        path: folderPath,
        created: stat.birthtime,
        fileCount: files.total,
        totalSize,
      };
    } catch (error) {
      console.error('Error getting folder info:', error);
      throw new Error('Folder not found');
    }
  }

  // Move folder
  async moveFolder(sourcePath: string, destinationPath: string): Promise<boolean> {
    try {
      const basePath = this.configService.getUploadPath();
      const fullSourcePath = path.join(basePath, sourcePath);
      const fullDestPath = path.join(basePath, destinationPath);

      if (!fs.existsSync(fullSourcePath)) {
        throw new Error('Source folder does not exist');
      }

      if (fs.existsSync(fullDestPath)) {
        throw new Error('Destination already exists');
      }

      // Move folder
      fs.renameSync(fullSourcePath, fullDestPath);

      // Update file paths in database
      const files = this.fileService.getFilesByFolder(sourcePath, 1, 10000);
      for (const file of files.files) {
        const newPath = file.path.replace(fullSourcePath, fullDestPath);
        const newFolderPath = file.folder_path.replace(sourcePath, destinationPath);
        this.fileService.updateFile(file.id, {
          path: newPath,
          folder_path: newFolderPath,
        });
      }

      return true;
    } catch (error) {
      console.error('Error moving folder:', error);
      return false;
    }
  }

  // Get folder tree structure
  getFolderTree(parentPath: string = '', maxDepth: number = 3): any {
    const folders = this.listFolders(parentPath);

    return folders.map(folder => ({
      ...folder,
      children: maxDepth > 1 ? this.getFolderTree(folder.path, maxDepth - 1) : [],
    }));
  }

  // Validate folder path
  validateFolderPath(folderPath: string): boolean {
    try {
      const basePath = this.configService.getUploadPath();
      const fullPath = path.join(basePath, folderPath);

      // Resolve to prevent directory traversal
      const resolvedPath = path.resolve(fullPath);
      const resolvedBase = path.resolve(basePath);

      // Ensure the resolved path is within the base path
      return resolvedPath.startsWith(resolvedBase);
    } catch (error) {
      return false;
    }
  }
}