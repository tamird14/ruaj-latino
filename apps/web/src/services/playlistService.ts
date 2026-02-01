import { api } from './api';
import type { Playlist, PlaylistWithSongs, CreatePlaylistInput, UpdatePlaylistInput } from '@ruaj-latino/shared';

export const playlistService = {
  async getPlaylists(): Promise<Playlist[]> {
    const response = await api.get<{ playlists: Playlist[] }>('/playlists');
    return response.data.playlists;
  },

  async getPlaylist(id: string, password?: string): Promise<PlaylistWithSongs> {
    const headers: Record<string, string> = {};
    if (password) {
      headers['X-Playlist-Password'] = password;
    }
    const response = await api.get<PlaylistWithSongs>(`/playlists/${id}`, { headers });
    return response.data;
  },

  async createPlaylist(data: CreatePlaylistInput): Promise<Playlist> {
    const response = await api.post<Playlist>('/playlists', data);
    return response.data;
  },

  async updatePlaylist(id: string, data: UpdatePlaylistInput, password?: string): Promise<Playlist> {
    const headers: Record<string, string> = {};
    if (password) {
      headers['X-Playlist-Password'] = password;
    }
    const response = await api.put<Playlist>(`/playlists/${id}`, data, { headers });
    return response.data;
  },

  async deletePlaylist(id: string, password?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (password) {
      headers['X-Playlist-Password'] = password;
    }
    await api.delete(`/playlists/${id}`, { headers });
  },

  async addSongs(playlistId: string, songIds: string[], password?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (password) {
      headers['X-Playlist-Password'] = password;
    }
    await api.post(`/playlists/${playlistId}/songs`, { songIds }, { headers });
  },

  async removeSong(playlistId: string, songId: string, password?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (password) {
      headers['X-Playlist-Password'] = password;
    }
    await api.delete(`/playlists/${playlistId}/songs/${songId}`, { headers });
  },

  async reorderSongs(playlistId: string, songIds: string[], password?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (password) {
      headers['X-Playlist-Password'] = password;
    }
    await api.put(`/playlists/${playlistId}/reorder`, { songIds }, { headers });
  },

  async verifyPassword(playlistId: string, password: string): Promise<boolean> {
    const response = await api.post<{ valid: boolean }>(`/playlists/${playlistId}/verify-password`, { password });
    return response.data.valid;
  },
};
