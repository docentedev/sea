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