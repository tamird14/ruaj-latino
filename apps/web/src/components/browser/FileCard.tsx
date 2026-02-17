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
    <div className="card-hover group">
      {/* Desktop layout: single row with hover-reveal buttons */}
      <div className="hidden md:flex items-center gap-4">
        <div className="w-12 h-12 bg-dark-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative">
          {thumbnail ? (
            <img src={thumbnail} alt={title || name} className="w-full h-full object-cover" />
          ) : (
            <Music className="w-5 h-5 text-gray-600" />
          )}
          <button
            onClick={handlePlay}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-5 h-5 text-white" fill="white" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate group-hover:text-primary-400 transition-colors">
            {title || name}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {artist && <span className="truncate">{artist}</span>}
            {duration && <span className="flex-shrink-0">{formatDuration(duration)}</span>}
            {!duration && size && <span className="flex-shrink-0">{formatFileSize(size)}</span>}
          </div>
        </div>
        {showAddToQueue && (
          <>
            <button
              onClick={handleAddToQueue}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Add to queue"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddToPlaylist}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Add to playlist"
            >
              <ListPlus className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Mobile layout: two rows - info on top, actions below */}
      <div className="md:hidden">
        {/* Row 1: thumbnail + song info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-dark-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative">
            {thumbnail ? (
              <img src={thumbnail} alt={title || name} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-white truncate">
              {title || name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {artist && <span className="truncate">{artist}</span>}
              {duration && <span className="flex-shrink-0">{formatDuration(duration)}</span>}
              {!duration && size && <span className="flex-shrink-0">{formatFileSize(size)}</span>}
            </div>
          </div>
        </div>

        {/* Row 2: action buttons - clear, large tap targets */}
        {showAddToQueue && (
          <div className="flex items-center gap-2 mt-2 pl-14">
            <button
              onClick={handlePlay}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-dark-800 hover:bg-dark-700 active:bg-dark-600 rounded-lg touch-manipulation transition-colors"
            >
              <Play className="w-3.5 h-3.5" fill="currentColor" />
              Play
            </button>
            <button
              onClick={handleAddToQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-dark-800 hover:bg-dark-700 active:bg-dark-600 rounded-lg touch-manipulation transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Queue
            </button>
            <button
              onClick={handleAddToPlaylist}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-dark-800 hover:bg-dark-700 active:bg-dark-600 rounded-lg touch-manipulation transition-colors"
            >
              <ListPlus className="w-3.5 h-3.5" />
              Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
