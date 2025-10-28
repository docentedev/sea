import { DatabaseSync } from 'node:sqlite';
import { SharedLinkRepository } from '../repositories/SharedLinkRepository.js';
import { SharedLink, CreateSharedLinkData } from '../models/SharedLink.js';

export class SharedLinkService {
  getActiveLinkForFile(file_id: number): SharedLink | null {
    return this.repo.findActiveByFileId(file_id);
  }
  private repo: SharedLinkRepository;

  constructor(db: DatabaseSync) {
    this.repo = new SharedLinkRepository(db);
  }

  createLink(data: CreateSharedLinkData): SharedLink {
    return this.repo.create(data);
  }

  getLink(token: string): SharedLink | null {
    return this.repo.findByToken(token);
  }

  accessLink(token: string): SharedLink | null {
    const link = this.repo.findByToken(token);
    if (!link || link.revoked) return null;
    if (link.expires_at && new Date(link.expires_at) < new Date()) return null;
    if (link.max_access_count && link.access_count >= link.max_access_count) {
      this.repo.revoke(token);
      return null;
    }
    this.repo.incrementAccess(token);
    return this.repo.findByToken(token);
  }

  revokeLink(token: string): void {
    this.repo.revoke(token);
  }

  deleteLink(token: string): void {
    this.repo.delete(token);
  }

  deleteLinksForFile(fileId: number): void {
    this.repo.deleteByFileId(fileId);
  }
}
