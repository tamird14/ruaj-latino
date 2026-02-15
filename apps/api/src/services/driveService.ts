import { getDriveClient } from '../config/google.js';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import type { GaxiosResponse } from 'gaxios';
import type { Readable } from 'stream';

const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
] as const;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  thumbnailLink?: string;
}

export interface ListFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

class DriveService {
  private get folderId() {
    return env.GOOGLE_DRIVE_FOLDER_ID;
  }

  async listMusicFiles(pageToken?: string, search?: string): Promise<ListFilesResponse> {
    const drive = getDriveClient();

    // Build query for audio files in the specified folder
    let query = `'${this.folderId}' in parents and trashed=false`;

    // Add mime type filter
    const mimeTypeFilter = AUDIO_MIME_TYPES.map((t) => `mimeType='${t}'`).join(' or ');
    query += ` and (${mimeTypeFilter})`;

    // Add search filter if provided
    if (search) {
      query += ` and name contains '${search.replace(/'/g, "\\'")}'`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, thumbnailLink)',
      pageSize: 1000,
      pageToken,
      orderBy: 'name',
    });

    return {
      files: (response.data.files || []) as DriveFile[],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  async getFile(fileId: string) {
    const drive = getDriveClient();

    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, modifiedTime, thumbnailLink',
    });

    return response.data as DriveFile;
  }

  async getFileStream(
    fileId: string,
    range?: string
  ): Promise<{
    stream: Readable;
    metadata: DriveFile;
    contentRange?: { start: number; end: number; size: number };
  }> {
    const drive = getDriveClient();

    // Get file metadata first
    const metadata = await this.getFile(fileId);
    const fileSize = parseInt(metadata.size, 10);

    // Parse range header if present
    let start = 0;
    let end = fileSize - 1;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Ensure valid range
      start = Math.max(0, start);
      end = Math.min(fileSize - 1, end);
    }

    // Get the file stream
    const response = (await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )) as GaxiosResponse<Readable>;

    return {
      stream: response.data,
      metadata,
      contentRange: range ? { start, end, size: fileSize } : undefined,
    };
  }

  async syncFilesToDatabase(): Promise<number> {
    let synced = 0;
    let pageToken: string | undefined;

    do {
      const response = await this.listMusicFiles(pageToken);

      for (const file of response.files) {
        await prisma.song.upsert({
          where: { driveFileId: file.id },
          update: {
            name: file.name,
            mimeType: file.mimeType,
            size: parseInt(file.size, 10),
            thumbnailUrl: file.thumbnailLink || null,
            lastSyncedAt: new Date(),
          },
          create: {
            driveFileId: file.id,
            name: file.name,
            title: this.extractTitle(file.name),
            mimeType: file.mimeType,
            size: parseInt(file.size, 10),
            thumbnailUrl: file.thumbnailLink || null,
          },
        });
        synced++;
      }

      pageToken = response.nextPageToken;
    } while (pageToken);

    return synced;
  }

  private extractTitle(filename: string): string {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Try to extract title from common patterns
    const patterns = [
      /^\d+[\.\-\s]+(.+)$/, // "01. Title" or "01 - Title"
      /^[^-]+ - (.+)$/, // "Artist - Title"
      /^(.+)$/, // Just the filename
    ];

    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return nameWithoutExt;
  }
}

export const driveService = new DriveService();
