export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextPageToken?: string;
}

export interface DriveFilesResponse {
  files: import('./song.js').DriveFile[];
  nextPageToken?: string;
}

export interface VerifyPasswordResponse {
  valid: boolean;
}
