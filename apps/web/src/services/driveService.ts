import { api } from './api';
import type { DriveFile, Song, PaginatedResponse } from '@ruaj-latino/shared';

interface DriveFilesParams {
  search?: string;
  page?: number;
  limit?: number;
  pageToken?: string;
}

interface DriveFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export const driveService = {
  async getFiles(params: DriveFilesParams = {}): Promise<DriveFilesResponse> {
    const response = await api.get<DriveFilesResponse>('/drive/files', { params });
    return response.data;
  },

  async searchFiles(query: string): Promise<DriveFile[]> {
    const response = await api.get<{ files: DriveFile[] }>('/drive/files', {
      params: { search: query },
    });
    return response.data.files;
  },

  async syncFiles(): Promise<{ synced: number }> {
    const response = await api.post<{ synced: number }>('/drive/sync');
    return response.data;
  },
};

export const songService = {
  async getSongs(params: { search?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<Song>> {
    const response = await api.get<PaginatedResponse<Song>>('/songs', { params });
    return response.data;
  },

  async getSong(id: string): Promise<Song> {
    const response = await api.get<Song>(`/songs/${id}`);
    return response.data;
  },
};
