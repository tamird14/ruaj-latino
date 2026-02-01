export * from './types/song.js';
export * from './types/playlist.js';
export * from './types/api.js';

export const AUDIO_MIME_TYPES = [
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

export const isAudioFile = (mimeType: string): boolean => {
  return AUDIO_MIME_TYPES.some(type => mimeType.includes(type) || type.includes(mimeType));
};
