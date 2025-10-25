import { DatabaseSync } from 'node:sqlite';
import { Folder, CreateFolderData, UpdateFolderData, FolderContent } from '../models/Folder';
import { File } from '../models/File';

export class FolderRepository {
  constructor(private db: DatabaseSync) {}

  async create(data: CreateFolderData): Promise<Folder> {
    const { name, path, parent_path, user_id } = data;

    const sql = `
      INSERT INTO folders (name, path, parent_path, user_id)
      VALUES (?, ?, ?, ?)
    `;

    const result = this.db.prepare(sql).run(name, path, parent_path, user_id);

    return {
      id: result.lastInsertRowid as number,
      name,
      path,
      parent_path,
      user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async findById(id: number): Promise<Folder | null> {
    const sql = `SELECT * FROM folders WHERE id = ?`;
    const row = this.db.prepare(sql).get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      path: row.path,
      parent_path: row.parent_path,
      user_id: row.user_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async findByPath(path: string): Promise<Folder | null> {
    console.log('🔍 findByPath called with path:', path, 'type:', typeof path);
    const sql = `SELECT * FROM folders WHERE path = ?`;
    console.log('🔍 Executing SQL:', sql, 'with param:', path);
    const row = this.db.prepare(sql).get(path) as any;
    console.log('🔍 Query result:', row ? 'found' : 'not found');

    if (!row) return null;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      path: row.path,
      parent_path: row.parent_path,
      user_id: row.user_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async findByUserId(userId: number): Promise<Folder[]> {
    const sql = `SELECT * FROM folders WHERE user_id = ? ORDER BY path`;
    const rows = this.db.prepare(sql).all(userId) as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      path: row.path,
      parent_path: row.parent_path,
      user_id: row.user_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async findByParentPath(parentPath: string | null, userId?: number): Promise<Folder[]> {
    let sql: string;
    let params: any[];
    if (parentPath === null || parentPath === '/') {
      // For root folders, find folders with parent_path IS NULL
      if (userId !== undefined) {
        sql = `SELECT * FROM folders WHERE (parent_path IS NULL OR parent_path = '/') AND user_id = ? ORDER BY name`;
        params = [userId];
      } else {
        sql = `SELECT * FROM folders WHERE (parent_path IS NULL OR parent_path = '/') ORDER BY name`;
        params = [];
      }
    } else {
      if (userId !== undefined) {
        sql = `SELECT * FROM folders WHERE parent_path = ? AND user_id = ? ORDER BY name`;
        params = [parentPath, userId];
      } else {
        sql = `SELECT * FROM folders WHERE parent_path = ? ORDER BY name`;
        params = [parentPath];
      }
    }

    const rows = this.db.prepare(sql).all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      path: row.path,
      parent_path: row.parent_path,
      user_id: row.user_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async getFolderContents(folderPath: string | null, userId?: number): Promise<FolderContent> {
    const folders = await this.findByParentPath(folderPath, userId);
    const files = await this.getFilesInFolder(folderPath, userId);

    return {
      folders,
      files,
      current_path: folderPath || '/',
      parent_path: folderPath ? folderPath.split('/').slice(0, -1).join('/') || null : null
    };
  }

  private async getFilesInFolder(folderPath: string | null, userId?: number): Promise<File[]> {
    let sql: string;
    let params: any[];

    if (folderPath === null || folderPath === '/') {
      // For root folder, find files with virtual_folder_path = '/' or virtual_folder_path IS NULL
      if (userId !== undefined) {
      sql = `SELECT * FROM files WHERE (virtual_folder_path = '/' OR virtual_folder_path IS NULL) AND user_id = ? ORDER BY filename`;
      params = [userId];
      } else {
      sql = `SELECT * FROM files WHERE (virtual_folder_path = '/' OR virtual_folder_path IS NULL) ORDER BY filename`;
      params = [];
      }
    } else {
      if (userId !== undefined) {
      sql = `SELECT * FROM files WHERE virtual_folder_path = ? AND user_id = ? ORDER BY filename`;
      params = [folderPath, userId];
      } else {
      sql = `SELECT * FROM files WHERE virtual_folder_path = ? ORDER BY filename`;
      params = [folderPath];
      }
    }

    const rows = this.db.prepare(sql).all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      filename: row.filename,
      original_filename: row.original_filename,
      path: row.path,
      size: row.size,
      mime_type: row.mime_type,
      user_id: row.user_id,
      folder_path: row.folder_path,
      virtual_folder_path: row.virtual_folder_path,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async update(id: number, data: UpdateFolderData): Promise<Folder | null> {
    const { name, path } = data;
    const sql = `UPDATE folders SET name = ?, path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const result = this.db.prepare(sql).run(name, path, id);

    if (result.changes === 0) {
      return null;
    }

    // Return updated folder
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM folders WHERE id = ?`;
    const result = this.db.prepare(sql).run(id);

    return result.changes > 0;
  }

  async deleteByPath(path: string): Promise<boolean> {
    const sql = `DELETE FROM folders WHERE path = ?`;
    const result = this.db.prepare(sql).run(path);

    return result.changes > 0;
  }

  async getPathHierarchy(userId: number): Promise<Folder[]> {
    const sql = `
      SELECT * FROM folders
      WHERE user_id = ?
      ORDER BY LENGTH(path) - LENGTH(REPLACE(path, '/', '')) ASC, path
    `;

    const rows = this.db.prepare(sql).all(userId) as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      path: row.path,
      parent_path: row.parent_path,
      user_id: row.user_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }
}