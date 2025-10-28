import { apiService } from './api';
import type { SharedLink, CreateSharedLinkData } from '../types/shared';

export async function createSharedLink(data: CreateSharedLinkData): Promise<{ token: string; url: string }> {
  const res = await apiService.post<{ token: string; url: string }>('/api/share', data);
  return res;
}

export async function getSharedLink(token: string, password?: string): Promise<SharedLink> {
  let url = `/api/shared/${token}`;
  if (password) {
    url += `?password=${encodeURIComponent(password)}`;
  }
  const res = await apiService.get<{ data: SharedLink }>(url);
  return res.data;
}

export async function accessSharedLink(token: string): Promise<SharedLink> {
  const res = await apiService.post<{ data: SharedLink }>(`/api/shared/${token}/access`);
  return res.data;
}

export async function revokeSharedLink(token: string): Promise<{ success: boolean }> {
  const res = await apiService.delete<{ success: boolean }>(`/api/shared/${token}`);
  return res;
}
