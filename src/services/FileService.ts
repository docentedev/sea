import { DatabaseSync } from 'node:sqlite';
import { DatabaseConnection } from '../database/connection.js';
import { FileRepository } from '../repositories/FileRepository.js';
import { ConfigurationService } from './ConfigurationService.js';
import { VirtualFolderService } from './VirtualFolderService.js';
import { FolderRepository } from '../repositories/FolderRepository.js';
import { File, CreateFileData, UpdateFileData, FileListResult, FileUploadResult } from '../models/File.js';
import { Configuration } from '../models/Configuration.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';

export class FileService {
  private db: DatabaseSync;
  private fileRepo: FileRepository;
  private configService: ConfigurationService;
  private virtualFolderService: VirtualFolderService;

  constructor() {
    this.db = DatabaseConnection.getConnection();
    this.fileRepo = new FileRepository(this.db);
    this.configService = new ConfigurationService();
    this.virtualFolderService = new VirtualFolderService(
      new FolderRepository(this.db),
      new FileRepository(this.db),
      this.db
    );
  }

  // File listing
  getAllFiles(page: number = 1, limit: number = 20): FileListResult {
    return this.fileRepo.findAll(page, limit);
  }

  getFilesByUser(userId: number, page: number = 1, limit: number = 20): FileListResult {
    return this.fileRepo.findByUserId(userId, page, limit);
  }

  getFilesByFolder(folderPath: string, page: number = 1, limit: number = 20): FileListResult {
    return this.fileRepo.findByFolderPath(folderPath, page, limit);
  }

  getFilesByVirtualFolder(virtualFolderPath: string, page: number = 1, limit: number = 20): FileListResult {
    return this.fileRepo.findByVirtualFolderPath(virtualFolderPath, page, limit);
  }

  getFileById(id: number): File | null {
    return this.fileRepo.findById(id);
  }

  // File upload
  async uploadFile(
    fileObj: any,
    filename: string,
    originalFilename: string,
    mimeType: string,
    userId: number,
    virtualFolderPath: string = '/'
  ): Promise<FileUploadResult> {
    try {
      // Ensure virtual folder exists (skip for root)
      if (virtualFolderPath !== '/') {
        await this.virtualFolderService.ensureFolderExists(virtualFolderPath, userId);
      }

      // Validar tamaño de archivo
      const maxFileSize = this.getMaxFileSize();
      let fileSize = 0;

      // Validar tipo de archivo
      if (!this.isFileTypeAllowed(mimeType, originalFilename)) {
        const blockedExts = this.getBlockedFileExtensions();
        const fileExt = originalFilename.toLowerCase().substring(originalFilename.lastIndexOf('.'));
        const isBlockedByExt = blockedExts.includes(fileExt);

        if (isBlockedByExt) {
          throw new Error(`File extension '${fileExt}' is blocked. Blocked extensions: ${blockedExts.join(', ')}`);
        } else {
          throw new Error(`File type '${mimeType}' is not allowed. Allowed types: ${this.getAllowedFileTypes().join(', ')}`);
        }
      }

      // Get upload base path from configuration
      const basePath = this.configService.getUploadPath();

      // Create folder structure by date (yyyy-mm-dd)
      const today = new Date();
      const dateFolder = today.toISOString().split('T')[0]; // yyyy-mm-dd
      const folderPath = path.join(basePath, dateFolder);

      // Ensure folder exists
      await this.ensureFolderExists(folderPath);

      // Generate unique filename to avoid conflicts
      const uniqueFilename = this.generateUniqueFilename(filename);
      const filePath = path.join(folderPath, uniqueFilename);

      // Save file to disk
      const buffer = await fileObj.toBuffer();
      fileSize = buffer.length;

      // Validate file size
      if (fileSize > maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${maxFileSize} bytes`);
      }

      fs.writeFileSync(filePath, buffer);

      // Save file metadata to database
      const fileData: CreateFileData = {
        filename: uniqueFilename,
        original_filename: originalFilename,
        path: filePath,
        size: fileSize,
        mime_type: mimeType,
        user_id: userId,
        folder_path: folderPath,
        virtual_folder_path: virtualFolderPath,
      };

      const file = this.fileRepo.create(fileData);

      return {
        file,
        url: `/api/files/${file.id}/download`,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Upload multiple files
  async uploadFiles(
    files: Array<{ file: any; filename: string; mimetype: string }>,
    userId: number,
    virtualFolderPath: string = '/'
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];
    const errors: string[] = [];

    for (const fileData of files) {
      try {
        const result = await this.uploadFile(
          fileData.file,
          fileData.filename,
          fileData.filename,
          fileData.mimetype,
          userId,
          virtualFolderPath
        );
        results.push(result);
      } catch (error: any) {
        errors.push(`${fileData.filename}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Some files failed to upload: ${errors.join(', ')}`);
    }

    return results;
  }

  // File download
  getFileStream(fileId: number): { stream: Readable; file: File } | null {
    const file = this.fileRepo.findById(fileId);
    if (!file) return null;

    try {
      const stream = fs.createReadStream(file.path);
      return { stream, file };
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  // File deletion
  deleteFile(fileId: number): boolean {
    const file = this.fileRepo.findById(fileId);
    if (!file) return false;

    try {
      // Delete from filesystem
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Delete from database
      return this.fileRepo.delete(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // File update (metadata only, not content)
  updateFile(id: number, data: UpdateFileData): File | null {
    return this.fileRepo.update(id, data);
  }

  // Utility methods
  getUserStorageUsage(userId: number): number {
    return this.fileRepo.getTotalSizeByUser(userId);
  }

  getFilesByDateRange(startDate: string, endDate: string): File[] {
    return this.fileRepo.getFilesByDateRange(startDate, endDate);
  }

  // Get maximum file size from configuration (in bytes)
  getMaxFileSize(): number {
    const configValue = this.configService.getConfigValue('max_file_size_mb');
    if (configValue) {
      const sizeInMB = parseInt(configValue);
      return sizeInMB * 1024 * 1024; // Convert MB to bytes
    }
    return 100 * 1024 * 1024; // Default 100MB
  }

  // Get allowed file types from configuration
  getAllowedFileTypes(): string[] {
    const configValue = this.configService.getConfigValue('allowed_file_types');
    if (configValue) {
      // Split by comma and trim whitespace
      return configValue.split(',').map(type => type.trim());
    }
    // Default allowed types
    return [
      'image/*',
      'application/pdf',
      'text/*',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/x-guitar-pro'
    ];
  }

  // Get blocked file extensions
  getBlockedFileExtensions(): string[] {
    const configValue = this.configService.getConfigValue('blocked_file_extensions');
    if (configValue) {
      // Split by comma, trim whitespace, and ensure they start with .
      return configValue.split(',').map(ext => {
        const trimmed = ext.trim().toLowerCase();
        return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
      });
    }
    // Default blocked extensions (common executable/script extensions)
    return ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.jar', '.py', '.pyc', '.pyo', '.pyd'];
  }

  // Validate file type against allowed types and blocked extensions
  isFileTypeAllowed(mimeType: string, fileName?: string): boolean {
    // First check MIME type
    const allowedTypes = this.getAllowedFileTypes();
    const mimeAllowed = allowedTypes.some(allowedType => {
      if (allowedType.includes('*')) {
        // Handle wildcard patterns like "image/*"
        const [mainType] = allowedType.split('/');
        return mimeType.startsWith(`${mainType}/`);
      } else {
        // Exact match
        return mimeType === allowedType;
      }
    });

    if (!mimeAllowed) {
      return false;
    }

    // Then check file extension if filename is provided
    if (fileName) {
      const blockedExtensions = this.getBlockedFileExtensions();
      const fileExt = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

      if (blockedExtensions.includes(fileExt)) {
        return false;
      }
    }

    return true;
  }

  // Set maximum file size configuration
  setMaxFileSize(sizeInMB: number): void {
    this.configService.setConfigValue('max_file_size_mb', sizeInMB.toString());
  }

  // Get configuration value
  getConfigValue(name: string): string | null {
    return this.configService.getConfigValue(name);
  }

  // Set configuration value
  setConfigValue(name: string, value: string): Configuration {
    return this.configService.setConfigValue(name, value);
  }

  // Get default file view mode
  getDefaultFileView(): string {
    const configValue = this.configService.getConfigValue('default_file_view');
    return configValue || 'list'; // Default to 'list' if not configured
  }

  // Set default file view mode
  setDefaultFileView(viewMode: string): void {
    if (!['list', 'grid'].includes(viewMode)) {
      throw new Error('Invalid view mode. Must be "list" or "grid"');
    }
    this.configService.setConfigValue('default_file_view', viewMode);
  }

  // Folder operations
  async createFolder(folderPath: string): Promise<void> {
    const basePath = this.configService.getUploadPath();
    const fullPath = path.join(basePath, folderPath);

    await this.ensureFolderExists(fullPath);
  }

  async deleteFolder(folderPath: string): Promise<boolean> {
    try {
      const basePath = this.configService.getUploadPath();
      const fullPath = path.join(basePath, folderPath);

      if (!fs.existsSync(fullPath)) {
        return false;
      }

      // Get all files in this folder and subfolders
      const files = this.fileRepo.findByFolderPath(folderPath).files;
      const subFolders = this.getSubFolders(fullPath);

      // Delete all files in database
      for (const file of files) {
        this.fileRepo.delete(file.id);
      }

      // Delete folder recursively from filesystem
      fs.rmSync(fullPath, { recursive: true, force: true });

      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  }

  listFolders(): string[] {
    try {
      const basePath = this.configService.getUploadPath();
      if (!fs.existsSync(basePath)) {
        return [];
      }

      const items = fs.readdirSync(basePath);
      return items.filter(item => {
        const itemPath = path.join(basePath, item);
        return fs.statSync(itemPath).isDirectory();
      });
    } catch (error) {
      console.error('Error listing folders:', error);
      return [];
    }
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(folderPath, { recursive: true });
    } catch (error) {
      if ((error as any).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  // Move file to different virtual folder
  async moveFile(fileId: number, newVirtualFolderPath: string, userId: number): Promise<File | null> {
    try {
      // Get current file
      const file = this.fileRepo.findById(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // Verify ownership
      if (file.user_id !== userId) {
        throw new Error('Access denied: file does not belong to user');
      }

      // If moving to root, set virtual_folder_path to empty string
      const normalizedPath = newVirtualFolderPath === '/' ? '' : newVirtualFolderPath;

      // Update file's virtual folder path
      const updateData: UpdateFileData = {
        virtual_folder_path: normalizedPath
      };

      const updatedFile = this.fileRepo.update(fileId, updateData);
      if (!updatedFile) {
        throw new Error('Failed to update file');
      }

      return updatedFile;
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }

  // Move multiple files to different virtual folder
  async moveFiles(fileIds: number[], newVirtualFolderPath: string, userId: number): Promise<File[]> {
    const movedFiles: File[] = [];

    for (const fileId of fileIds) {
      const movedFile = await this.moveFile(fileId, newVirtualFolderPath, userId);
      if (movedFile) {
        movedFiles.push(movedFile);
      }
    }

    return movedFiles;
  }

  // Check if virtual folder exists for user
  async virtualFolderExists(virtualFolderPath: string, userId: number): Promise<boolean> {
    // For root folder, always exists
    if (virtualFolderPath === '/') {
      return true;
    }

    // Check if folder exists in database for this user
    const userFolders = await this.virtualFolderService.getUserFolders(userId);
    return userFolders.some(folder => folder.path === virtualFolderPath);
  }

  private generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const base = path.basename(originalFilename, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${base}_${timestamp}_${random}${ext}`;
  }

  private getSubFolders(folderPath: string): string[] {
    const folders: string[] = [];

    function scanDir(dir: string) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
          folders.push(itemPath);
          scanDir(itemPath);
        }
      }
    }

    scanDir(folderPath);
    return folders;
  }
}