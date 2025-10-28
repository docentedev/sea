import { DatabaseSync } from 'node:sqlite';
import { SharedLink, CreateSharedLinkData } from '../models/SharedLink';
import { randomBytes } from 'crypto';
import { hashPassword } from '../utils/hash';

export class SharedLinkRepository {
  findActiveByFileId(file_id: number): SharedLink | null {
    const row = this.db.prepare('SELECT * FROM shared_links WHERE file_id = ? AND revoked = 0 ORDER BY created_at DESC LIMIT 1').get(file_id);
    return row ? this.mapRow(row) : null;
  }
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  create(data: CreateSharedLinkData): SharedLink {
  const token = randomBytes(16).toString('base64url');
    const password_hash = data.password ? hashPassword(data.password) : null;
    const stmt = this.db.prepare(`
      INSERT INTO shared_links (file_id, user_id, token, password_hash, expires_at, max_access_count, access_count, revoked)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0)
    `);
    stmt.run(
      data.file_id,
      data.user_id ?? null,
      token,
      password_hash,
      data.expires_at ?? null,
      data.max_access_count ?? null
    );
    return this.findByToken(token)!;
  }

  findByToken(token: string): SharedLink | null {
    const row = this.db.prepare('SELECT * FROM shared_links WHERE token = ?').get(token);
    return row ? this.mapRow(row) : null;
  }

  incrementAccess(token: string): void {
    this.db.prepare(`
      UPDATE shared_links SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE token = ?
    `).run(token);
  }

  revoke(token: string): void {
    this.db.prepare('UPDATE shared_links SET revoked = 1 WHERE token = ?').run(token);
  }

  delete(token: string): void {
    this.db.prepare('DELETE FROM shared_links WHERE token = ?').run(token);
  }

  deleteByFileId(fileId: number): void {
    this.db.prepare('DELETE FROM shared_links WHERE file_id = ?').run(fileId);
  }

  mapRow(row: any): SharedLink {
    return {
      id: row.id,
      file_id: row.file_id,
      user_id: row.user_id,
      token: row.token,
      password_hash: row.password_hash,
      expires_at: row.expires_at,
      max_access_count: row.max_access_count,
      access_count: row.access_count,
      created_at: row.created_at,
      last_accessed: row.last_accessed,
      revoked: Boolean(row.revoked)
    };
  }
}
