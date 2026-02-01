export interface Song {
  id: string;
  driveFileId: string;
  name: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  duration: number | null;
  mimeType: string;
  size: number;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  thumbnailLink?: string;
}
