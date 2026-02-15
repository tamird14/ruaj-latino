import { Play, Plus, Music, ListPlus } from 'lucide-react';
import type { Song, DriveFile } from '@ruaj-latino/shared';
import { useQueueStore, useUIStore } from '../../store';
import { formatDuration, formatFileSize, extractSongTitle } from '../../utils/formatters';

interface FileCardProps {
  file: DriveFile | Song;
  showAddToQueue?: boolean;
  // For playlist context - when provided, play sets the full queue
  playlistSongs?: Song[];
  playlistIndex?: number;
}

export const FileCard = ({ file, showAddToQueue = true, playlistSongs, playlistIndex }: FileCardProps) => {
  const { setQueue, addToQueue, queue } = useQueueStore();
  const { addToast, openAddToPlaylistModal } = useUIStore();

  // Determine if it's a Song or DriveFile
  const isSong = 'driveFileId' in file;
  const id = isSong ? (file as Song).id : (file as DriveFile).id;
  const name = file.name;
  const title = isSong ? (file as Song).title : extractSongTitle(name);
  const artist = isSong ? (file as Song).artist : null;
  const duration = isSong ? (file as Song).duration : null;
  const size = typeof file.size === 'string' ? parseInt(file.size) : file.size;
  const thumbnail = isSong ? (file as Song).thumbnailUrl : null;

  const handlePlay = () => {
    // If playing from a playlist context, set the full playlist queue
    if (playlistSongs && playlistIndex !== undefined) {
      setQueue(playlistSongs, playlistIndex);
      addToast(`Now playing: ${title || name}`, 'info');
      return;
    }

    // Convert to Song format if it's a DriveFile
    const song: Song = isSong
      ? (file as Song)
      : {
          id: (file as DriveFile).id,
          driveFileId: (file as DriveFile).id,
          name: name,
          title: extractSongTitle(name),
          artist: null,
          album: null,
          duration: null,
          mimeType: (file as DriveFile).mimeType,
          size: parseInt((file as DriveFile).size),
          thumbnailUrl: (file as DriveFile).thumbnailLink || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    setQueue([song]);
    addToast(`Now playing: ${title || name}`, 'info');
  };

  const handleAddToQueue = () => {
    const song: Song = isSong
      ? (file as Song)
      : {
          id: (file as DriveFile).id,
          driveFileId: (file as DriveFile).id,
          name: name,
          title: extractSongTitle(name),
          artist: null,
          album: null,
          duration: null,
          mimeType: (file as DriveFile).mimeType,
          size: parseInt((file as DriveFile).size),
          thumbnailUrl: (file as DriveFile).thumbnailLink || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    // Check if already in queue
    const isInQueue = queue.some((s) => s.id === song.id || s.driveFileId === song.driveFileId);
    if (isInQueue) {
      addToast('Song is already in queue', 'info');
      return;
    }

    addToQueue([song]);
    addToast(`Added to queue: ${title || name}`, 'success');
  };

  const handleAddToPlaylist = () => {
    openAddToPlaylistModal([id]);
  };

  return (
    <div className="card-hover group flex items-center gap-2 md:gap-4">
      {/* Thumbnail */}
      <div className="w-12 h-12 bg-dark-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden relative">
        {thumbnail ? (
          <img src={thumbnail} alt={title || name} className="w-full h-full object-cover" />
        ) : (
          <Music className="w-5 h-5 text-gray-600" />
        )}

        {/* Play overlay */}
        <button
          onClick={handlePlay}
          className="absolute inset-0 bg-black/60 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 md:transition-opacity"
        >
          <Play className="w-5 h-5 text-white" fill="white" />
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate group-hover:text-primary-400 transition-colors">
          {title || name}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {artist && <span className="truncate">{artist}</span>}
          {duration && <span>{formatDuration(duration)}</span>}
          {!duration && size && <span>{formatFileSize(size)}</span>}
        </div>
      </div>

      {/* Actions */}
      {showAddToQueue && (
        <>
          <button
            onClick={handleAddToQueue}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg md:opacity-0 md:group-hover:opacity-100 md:transition-opacity"
            title="Add to queue"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddToPlaylist}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg md:opacity-0 md:group-hover:opacity-100 md:transition-opacity"
            title="Add to playlist"
          >
            <ListPlus className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};
