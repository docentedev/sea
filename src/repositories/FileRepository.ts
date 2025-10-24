import { DatabaseSync } from 'node:sqlite';
import { File, CreateFileData, UpdateFileData, FileListResult } from '../models/File.js';

export class FileRepository {
  constructor(private db: DatabaseSync) {}

  findAll(page: number = 1, limit: number = 20): FileListResult {
    const offset = (page - 1) * limit;

    // Get total count
    const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM files');
    const countResult = countStmt.get() as any;
    const total = countResult.total;

    // Get files with pagination
    const stmt = this.db.prepare(`
      SELECT id, filename, original_filename, path, size, mime_type, user_id,
             folder_path, virtual_folder_path, created_at, updated_at
      FROM files
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(limit, offset) as any[];
    const files = rows.map(this.mapRowToFile);

    return {
      files,
      total,
      page,
      limit,
    };
  }

  findById(id: number): File | null {
    const stmt = this.db.prepare(`
      SELECT id, filename, original_filename, path, size, mime_type, user_id,
             folder_path, virtual_folder_path, created_at, updated_at
      FROM files
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    return row ? this.mapRowToFile(row) : null;
  }

  findByUserId(userId: number, page: number = 1, limit: number = 20): FileListResult {
    const offset = (page - 1) * limit;

    // Get total count for user
    const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM files WHERE user_id = ?');
    const countResult = countStmt.get(userId) as any;
    const total = countResult.total;

    // Get files for user with pagination
    const stmt = this.db.prepare(`
      SELECT id, filename, original_filename, path, size, mime_type, user_id,
             folder_path, virtual_folder_path, created_at, updated_at
      FROM files
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(userId, limit, offset) as any[];
    const files = rows.map(this.mapRowToFile);

    return {
      files,
      total,
      page,
      limit,
    };
  }

  findByFolderPath(folderPath: string, page: number = 1, limit: number = 20): FileListResult {
    const offset = (page - 1) * limit;

    // Get total count for folder
    const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM files WHERE folder_path = ?');
    const countResult = countStmt.get(folderPath) as any;
    const total = countResult.total;

    // Get files for folder with pagination
    const stmt = this.db.prepare(`
      SELECT id, filename, original_filename, path, size, mime_type, user_id,
             folder_path, virtual_folder_path, created_at, updated_at
      FROM files
      WHERE folder_path = ?
      ORDER BY filename ASC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(folderPath, limit, offset) as any[];
    const files = rows.map(this.mapRowToFile);

    return {
      files,
      total,
      page,
      limit,
    };
  }

  findByVirtualFolderPath(virtualFolderPath: string, page: number = 1, limit: number = 20): FileListResult {
    const offset = (page - 1) * limit;

    // Get total count for virtual folder
    const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM files WHERE virtual_folder_path = ?');
    const countResult = countStmt.get(virtualFolderPath) as any;
    const total = countResult.total;

    // Get files for virtual folder with pagination
    const stmt = this.db.prepare(`
      SELECT id, filename, original_filename, path, size, mime_type, user_id,
             folder_path, virtual_folder_path, created_at, updated_at
      FROM files
      WHERE virtual_folder_path = ?
      ORDER BY filename ASC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(virtualFolderPath, limit, offset) as any[];
    const files = rows.map(this.mapRowToFile);

    return {
      files,
      total,
      page,
      limit,
    };
  }

  findByVirtualFolderPathRecursive(virtualFolderPath: string, userId: number): File[] {
    // Find all files where virtual_folder_path equals the given path or starts with path/
    const sql = `
      SELECT id, filename, original_filename, path, size, mime_type, user_id,
             folder_path, virtual_folder_path, created_at, updated_at
      FROM files
      WHERE user_id = ? AND (virtual_folder_path = ? OR virtual_folder_path LIKE ?)
      ORDER BY virtual_folder_path ASC, filename ASC
    `;

    const rows = this.db.prepare(sql).all(userId, virtualFolderPath, `${virtualFolderPath}/%`) as any[];
    return rows.map(this.mapRowToFile);
  }

  findByFilename(filename: string): File | null {
    const stmt = this.db.prepare(`
      SELECT id, filename, original_filename, path, size, mime_type, user_id,
             folder_path, virtual_folder_path, created_at, updated_at
      FROM files
      WHERE filename = ?
    `);

    const row = stmt.get(filename) as any;
    return row ? this.mapRowToFile(row) : null;
  }

  create(data: CreateFileData): File {
    const stmt = this.db.prepare(`
      INSERT INTO files (filename, original_filename, path, size, mime_type, user_id, folder_path, virtual_folder_path, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(
      data.filename,
      data.original_filename,
      data.path,
      data.size,
      data.mime_type,
      data.user_id,
      data.folder_path,
      data.virtual_folder_path || '/'
    );
    const id = result.lastInsertRowid as number;

    return {
      id,
      filename: data.filename,
      original_filename: data.original_filename,
      path: data.path,
      size: data.size,
      mime_type: data.mime_type,
      user_id: data.user_id,
      folder_path: data.folder_path,
      virtual_folder_path: data.virtual_folder_path || '/',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  update(id: number, data: UpdateFileData): File | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.filename !== undefined) {
      updates.push('filename = ?');
      values.push(data.filename);
    }

    if (data.original_filename !== undefined) {
      updates.push('original_filename = ?');
      values.push(data.original_filename);
    }

    if (data.path !== undefined) {
      updates.push('path = ?');
      values.push(data.path);
    }

    if (data.size !== undefined) {
      updates.push('size = ?');
      values.push(data.size);
    }

    if (data.mime_type !== undefined) {
      updates.push('mime_type = ?');
      values.push(data.mime_type);
    }

    if (data.folder_path !== undefined) {
      updates.push('folder_path = ?');
      values.push(data.folder_path);
    }

    if (data.virtual_folder_path !== undefined) {
      updates.push('virtual_folder_path = ?');
      values.push(data.virtual_folder_path);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = datetime(\'now\')');
    const stmt = this.db.prepare(`
      UPDATE files
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    values.push(id);
    stmt.run(...values);

    return this.findById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM files WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getTotalSizeByUser(userId: number): number {
    const stmt = this.db.prepare('SELECT SUM(size) as total FROM files WHERE user_id = ?');
    const result = stmt.get(userId) as any;
    return result.total || 0;
  }

  getFilesByDateRange(startDate: string, endDate: string): File[] {
    const stmt = this.db.prepare(`
      SELECT id, filename, original_filename, path, size, mime_type, user_id,
             folder_path, created_at, updated_at
      FROM files
      WHERE created_at BETWEEN ? AND ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(startDate, endDate) as any[];
    return rows.map(this.mapRowToFile);
  }

  private mapRowToFile(row: any): File {
    return {
      id: row.id,
      filename: row.filename,
      original_filename: row.original_filename,
      path: row.path,
      size: row.size,
      mime_type: row.mime_type,
      user_id: row.user_id,
      folder_path: row.folder_path,
      virtual_folder_path: row.virtual_folder_path || '/',
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}