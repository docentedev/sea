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
    const sql = `SELECT * FROM folders WHERE path = ?`;
    const row = this.db.prepare(sql).get(path) as any;

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

  async findByParentPath(parentPath: string | null, userId: number): Promise<Folder[]> {
    const sql = `SELECT * FROM folders WHERE parent_path IS ? AND user_id = ? ORDER BY name`;
    const rows = this.db.prepare(sql).all(parentPath, userId) as any[];

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

  async getFolderContents(folderPath: string | null, userId: number): Promise<FolderContent> {
    const folders = await this.findByParentPath(folderPath, userId);
    const files = await this.getFilesInFolder(folderPath, userId);

    return {
      folders,
      files,
      current_path: folderPath || '/',
      parent_path: folderPath ? folderPath.split('/').slice(0, -1).join('/') || null : null
    };
  }

  private async getFilesInFolder(folderPath: string | null, userId: number): Promise<File[]> {
    const sql = `SELECT * FROM files WHERE virtual_folder_path = ? AND user_id = ? ORDER BY filename`;
    const rows = this.db.prepare(sql).all(folderPath || '/', userId) as any[];

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