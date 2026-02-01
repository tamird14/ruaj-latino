import { create } from 'zustand';
import type { Playlist, PlaylistWithSongs } from '@ruaj-latino/shared';
import { playlistService } from '../services/playlistService';

interface PlaylistState {
  playlists: Playlist[];
  currentPlaylist: PlaylistWithSongs | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPlaylists: () => Promise<void>;
  fetchPlaylist: (id: string, password?: string) => Promise<PlaylistWithSongs | undefined>;
  createPlaylist: (data: { name: string; description?: string; isPublic?: boolean; password?: string; songIds?: string[] }) => Promise<Playlist>;
  updatePlaylist: (id: string, data: { name?: string; description?: string; isPublic?: boolean; password?: string }, password?: string) => Promise<void>;
  deletePlaylist: (id: string, password?: string) => Promise<void>;
  addSongsToPlaylist: (playlistId: string, songIds: string[], password?: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string, password?: string) => Promise<void>;
  reorderSongs: (playlistId: string, songIds: string[], password?: string) => Promise<void>;
  verifyPassword: (playlistId: string, password: string) => Promise<boolean>;
  clearError: () => void;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  currentPlaylist: null,
  isLoading: false,
  error: null,

  fetchPlaylists: async () => {
    set({ isLoading: true, error: null });
    try {
      const playlists = await playlistService.getPlaylists();
      set({ playlists, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchPlaylist: async (id, password) => {
    set({ isLoading: true, error: null });
    try {
      const playlist = await playlistService.getPlaylist(id, password);
      set({ currentPlaylist: playlist, isLoading: false });
      return playlist;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return undefined;
    }
  },

  createPlaylist: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const playlist = await playlistService.createPlaylist(data);
      set((state) => ({
        playlists: [...state.playlists, playlist],
        isLoading: false,
      }));
      return playlist;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updatePlaylist: async (id, data, password) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await playlistService.updatePlaylist(id, data, password);
      set((state) => ({
        playlists: state.playlists.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        currentPlaylist: state.currentPlaylist?.id === id
          ? { ...state.currentPlaylist, ...updated }
          : state.currentPlaylist,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deletePlaylist: async (id, password) => {
    set({ isLoading: true, error: null });
    try {
      await playlistService.deletePlaylist(id, password);
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== id),
        currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  addSongsToPlaylist: async (playlistId, songIds, password) => {
    set({ isLoading: true, error: null });
    try {
      await playlistService.addSongs(playlistId, songIds, password);
      // Refresh the playlist to get updated songs
      const { currentPlaylist } = get();
      if (currentPlaylist?.id === playlistId) {
        await get().fetchPlaylist(playlistId, password);
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  removeSongFromPlaylist: async (playlistId, songId, password) => {
    set({ isLoading: true, error: null });
    try {
      await playlistService.removeSong(playlistId, songId, password);
      set((state) => {
        if (state.currentPlaylist?.id === playlistId) {
          return {
            currentPlaylist: {
              ...state.currentPlaylist,
              songs: state.currentPlaylist.songs.filter((s) => s.song.id !== songId),
              songCount: state.currentPlaylist.songCount - 1,
            },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  reorderSongs: async (playlistId, songIds, password) => {
    set({ isLoading: true, error: null });
    try {
      await playlistService.reorderSongs(playlistId, songIds, password);
      // Optimistically update the order
      set((state) => {
        if (state.currentPlaylist?.id === playlistId) {
          const songMap = new Map(state.currentPlaylist.songs.map((s) => [s.song.id, s]));
          const reorderedSongs = songIds
            .map((id, index) => {
              const playlistSong = songMap.get(id);
              return playlistSong ? { ...playlistSong, position: index } : null;
            })
            .filter(Boolean) as typeof state.currentPlaylist.songs;

          return {
            currentPlaylist: {
              ...state.currentPlaylist,
              songs: reorderedSongs,
            },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  verifyPassword: async (playlistId, password) => {
    try {
      return await playlistService.verifyPassword(playlistId, password);
    } catch {
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
