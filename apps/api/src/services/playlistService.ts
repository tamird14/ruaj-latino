import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import type { Playlist, PlaylistSong, Song } from '@prisma/client';

const SALT_ROUNDS = 10;

export interface PlaylistWithSongs extends Playlist {
  songs: (PlaylistSong & { song: Song })[];
  songCount: number;
  isProtected: boolean;
}

class PlaylistService {
  async getPlaylists(includePrivate = false): Promise<(Playlist & { songCount: number; isProtected: boolean })[]> {
    const where = includePrivate ? { isDeleted: false } : { isPublic: true, isDeleted: false };

    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        _count: {
          select: { songs: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return playlists.map((p) => ({
      ...p,
      songCount: p._count.songs,
      isProtected: !!p.passwordHash,
      passwordHash: null, // Don't expose password hash
    })) as (Playlist & { songCount: number; isProtected: boolean })[];
  }

  async getPlaylist(id: string, password?: string): Promise<PlaylistWithSongs> {
    const playlist = await prisma.playlist.findFirst({
      where: { id, isDeleted: false },
      include: {
        songs: {
          include: { song: true },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { songs: true },
        },
      },
    });

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // Check password if protected and not public
    if (playlist.passwordHash && !playlist.isPublic) {
      if (!password) {
        throw new Error('Password required');
      }
      const valid = await bcrypt.compare(password, playlist.passwordHash);
      if (!valid) {
        throw new Error('Invalid password');
      }
    }

    return {
      ...playlist,
      songCount: playlist._count.songs,
      isProtected: !!playlist.passwordHash,
      passwordHash: null,
    } as unknown as PlaylistWithSongs;
  }

  async createPlaylist(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
    password?: string;
    songIds?: string[];
  }): Promise<Playlist & { songCount: number; isProtected: boolean }> {
    const passwordHash = data.password
      ? await bcrypt.hash(data.password, SALT_ROUNDS)
      : null;

    const playlist = await prisma.playlist.create({
      data: {
        name: data.name,
        description: data.description,
        isPublic: data.isPublic ?? true,
        passwordHash,
        songs: data.songIds?.length
          ? {
              create: data.songIds.map((songId, index) => ({
                songId,
                position: index,
              })),
            }
          : undefined,
      },
      include: {
        _count: {
          select: { songs: true },
        },
      },
    });

    return {
      ...playlist,
      songCount: playlist._count.songs,
      isProtected: !!playlist.passwordHash,
      passwordHash: null,
    } as Playlist & { songCount: number; isProtected: boolean };
  }

  async updatePlaylist(
    id: string,
    data: {
      name?: string;
      description?: string;
      isPublic?: boolean;
      password?: string;
      removePassword?: boolean;
    },
    password?: string
  ): Promise<Playlist & { songCount: number; isProtected: boolean }> {
    // Verify password first
    await this.verifyPlaylistPassword(id, password);

    let newPasswordHash: string | null | undefined;

    if (data.removePassword) {
      newPasswordHash = null;
    } else if (data.password) {
      newPasswordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isPublic: data.isPublic,
        passwordHash: newPasswordHash,
      },
      include: {
        _count: {
          select: { songs: true },
        },
      },
    });

    return {
      ...playlist,
      songCount: playlist._count.songs,
      isProtected: !!playlist.passwordHash,
      passwordHash: null,
    } as Playlist & { songCount: number; isProtected: boolean };
  }

  async deletePlaylist(id: string, password?: string): Promise<void> {
    // Verify password first
    await this.verifyPlaylistPassword(id, password);

    // Soft delete
    await prisma.playlist.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async addSongs(playlistId: string, songIds: string[], password?: string): Promise<void> {
    await this.verifyPlaylistPassword(playlistId, password);

    // Resolve song IDs - they might be database UUIDs or Drive file IDs
    const resolvedSongIds: string[] = [];
    for (const id of songIds) {
      // First try to find by database ID
      let song = await prisma.song.findUnique({ where: { id } });

      // If not found, try by driveFileId
      if (!song) {
        song = await prisma.song.findUnique({ where: { driveFileId: id } });
      }

      // If still not found, create a new song record from Drive
      if (!song) {
        try {
          const { driveService } = await import('./driveService.js');
          const driveFile = await driveService.getFile(id);
          song = await prisma.song.create({
            data: {
              driveFileId: driveFile.id,
              name: driveFile.name,
              title: driveFile.name.replace(/\.[^/.]+$/, ''),
              mimeType: driveFile.mimeType,
              size: parseInt(driveFile.size, 10),
              thumbnailUrl: driveFile.thumbnailLink || null,
            },
          });
        } catch {
          // Skip if we can't resolve the song
          continue;
        }
      }

      resolvedSongIds.push(song.id);
    }

    if (resolvedSongIds.length === 0) return;

    // Filter out songs already in the playlist
    const existingSongs = await prisma.playlistSong.findMany({
      where: { playlistId, songId: { in: resolvedSongIds } },
      select: { songId: true },
    });
    const existingSongIds = new Set(existingSongs.map((s) => s.songId));
    const newSongIds = resolvedSongIds.filter((id) => !existingSongIds.has(id));

    if (newSongIds.length === 0) return;

    // Get current max position
    const lastSong = await prisma.playlistSong.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
    });

    const startPosition = (lastSong?.position ?? -1) + 1;

    await prisma.playlistSong.createMany({
      data: newSongIds.map((songId, index) => ({
        playlistId,
        songId,
        position: startPosition + index,
      })),
    });
  }

  async removeSong(playlistId: string, songId: string, password?: string): Promise<void> {
    await this.verifyPlaylistPassword(playlistId, password);

    const removedSong = await prisma.playlistSong.findFirst({
      where: { playlistId, songId },
    });

    if (!removedSong) return;

    // Delete the song
    await prisma.playlistSong.delete({
      where: { id: removedSong.id },
    });

    // Reorder remaining songs
    await prisma.playlistSong.updateMany({
      where: {
        playlistId,
        position: { gt: removedSong.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });
  }

  async reorderSongs(playlistId: string, songIds: string[], password?: string): Promise<void> {
    await this.verifyPlaylistPassword(playlistId, password);

    // Use a two-phase approach to avoid violating the unique constraint
    // on [playlistId, position]. First move all songs to temporary negative
    // positions, then set the final positions.
    await prisma.$transaction(async (tx) => {
      // Phase 1: assign temporary negative positions to avoid unique conflicts
      for (let i = 0; i < songIds.length; i++) {
        await tx.playlistSong.updateMany({
          where: { playlistId, songId: songIds[i] },
          data: { position: -(i + 1) },
        });
      }

      // Phase 2: assign the final positions
      for (let i = 0; i < songIds.length; i++) {
        await tx.playlistSong.updateMany({
          where: { playlistId, songId: songIds[i] },
          data: { position: i },
        });
      }
    });
  }

  async verifyPassword(playlistId: string, password: string): Promise<boolean> {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { passwordHash: true },
    });

    if (!playlist || !playlist.passwordHash) {
      return true; // No password set
    }

    return bcrypt.compare(password, playlist.passwordHash);
  }

  private async verifyPlaylistPassword(playlistId: string, password?: string): Promise<void> {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { passwordHash: true },
    });

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.passwordHash) {
      if (!password) {
        throw new Error('Password required');
      }
      const valid = await bcrypt.compare(password, playlist.passwordHash);
      if (!valid) {
        throw new Error('Invalid password');
      }
    }
  }
}

export const playlistService = new PlaylistService();
