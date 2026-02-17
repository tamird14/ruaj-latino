import { Play, Plus, Music, ListPlus } from 'lucide-react';
import type { Song, DriveFile } from '@ruaj-latino/shared';
import { useQueueStore, useUIStore } from '../../store';
import { formatDuration, formatFileSize, extractSongTitle } from '../../utils/formatters';
import type { MouseEvent } from 'react';

interface FileCardProps {
  file: DriveFile | Song;
  showAddToQueue?: boolean;
  playlistSongs?: Song[];
  playlistIndex?: number;
}

export const FileCard = ({ file, showAddToQueue = true, playlistSongs, playlistIndex }: FileCardProps) => {
  const { setQueue, addToQueue, queue } = useQueueStore();
  const { addToast, openAddToPlaylistModal } = useUIStore();

  const isSong = 'driveFileId' in file;
  const id = isSong ? (file as Song).id : (file as DriveFile).id;
  const name = file.name;
  const title = isSong ? (file as Song).title : extractSongTitle(name);
  const artist = isSong ? (file as Song).artist : null;
  const duration = isSong ? (file as Song).duration : null;
  const size = typeof file.size === 'string' ? parseInt(file.size) : file.size;
  const thumbnail = isSong ? (file as Song).thumbnailUrl : null;

  const toSong = (): Song =>
    isSong
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

  const handlePlay = (e: MouseEvent) => {
    e.stopPropagation();
    if (playlistSongs && playlistIndex !== undefined) {
      setQueue(playlistSongs, playlistIndex);
      addToast(`Now playing: ${title || name}`, 'info');
      return;
    }
    setQueue([toSong()]);
    addToast(`Now playing: ${title || name}`, 'info');
  };

  const handleAddToQueue = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const song = toSong();
    const isInQueue = queue.some((s) => s.id === song.id || s.driveFileId === song.driveFileId);
    if (isInQueue) {
      addToast('Song is already in queue', 'info');
      return;
    }
    addToQueue([song]);
    addToast(`Added to queue: ${title || name}`, 'success');
  };

  const handleAddToPlaylist = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openAddToPlaylistModal([id]);
  };

  return (
    <div className="card-hover group flex items-center gap-3 md:gap-4">
      {/* Thumbnail with play overlay */}
      <div className="w-11 h-11 md:w-12 md:h-12 bg-dark-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative">
        {thumbnail ? (
          <img src={thumbnail} alt={title || name} className="w-full h-full object-cover" />
        ) : (
          <Music className="w-5 h-5 text-gray-600" />
        )}
        <button
          onClick={handlePlay}
          className="absolute inset-0 bg-black/50 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 md:transition-opacity touch-manipulation"
        >
          <Play className="w-5 h-5 text-white" fill="white" />
        </button>
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm md:text-base text-white truncate group-hover:text-primary-400 transition-colors">
          {title || name}
        </p>
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
          {artist && <span className="truncate">{artist}</span>}
          {duration && <span className="flex-shrink-0">{formatDuration(duration)}</span>}
          {!duration && size && <span className="flex-shrink-0">{formatFileSize(size)}</span>}
        </div>
      </div>

      {/* Action buttons - always visible on mobile, hover on desktop */}
      {showAddToQueue && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleAddToQueue}
            className="p-2 min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] flex items-center justify-center text-gray-400 hover:text-primary-400 active:text-primary-300 bg-dark-800/60 md:bg-transparent hover:bg-dark-700 active:bg-dark-600 rounded-lg md:opacity-0 md:group-hover:opacity-100 md:transition-opacity touch-manipulation"
            title="Add to queue"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={handleAddToPlaylist}
            className="p-2 min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] flex items-center justify-center text-gray-400 hover:text-primary-400 active:text-primary-300 bg-dark-800/60 md:bg-transparent hover:bg-dark-700 active:bg-dark-600 rounded-lg md:opacity-0 md:group-hover:opacity-100 md:transition-opacity touch-manipulation"
            title="Add to playlist"
          >
            <ListPlus className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
