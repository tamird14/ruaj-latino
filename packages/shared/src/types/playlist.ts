import { Song } from './song.js';

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  isProtected: boolean; // Has password (hash not exposed)
  createdAt: string;
  updatedAt: string;
  songCount: number;
}

export interface PlaylistWithSongs extends Playlist {
  songs: PlaylistSong[];
}

export interface PlaylistSong {
  id: string;
  position: number;
  addedAt: string;
  song: Song;
}

export interface CreatePlaylistInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  password?: string;
  songIds?: string[];
}

export interface UpdatePlaylistInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  password?: string; // Set new password
  removePassword?: boolean; // Remove existing password
}

export interface ReorderSongsInput {
  songIds: string[]; // New order of song IDs
}
