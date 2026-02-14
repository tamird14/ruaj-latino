import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { usePlayerStore, useQueueStore } from '../../store';

export const NowPlaying = () => {
  const { currentSong } = usePlayerStore();
  const { queue, currentIndex } = useQueueStore();

  if (!currentSong) {
    return (
      <div className="w-auto md:w-48 flex items-center gap-3 text-gray-500">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-dark-800 rounded flex-shrink-0 flex items-center justify-center">
          <Music className="w-5 h-5" />
        </div>
        <div className="hidden md:block">
          <p className="text-sm">No song playing</p>
        </div>
      </div>
    );
  }

  return (
    <Link to="/queue" className="min-w-0 shrink-0 flex items-center gap-2 md:gap-3 md:w-48 group">
      {/* Thumbnail */}
      <div className="w-10 h-10 md:w-12 md:h-12 bg-dark-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
        {currentSong.thumbnailUrl ? (
          <img
            src={currentSong.thumbnailUrl}
            alt={currentSong.title || currentSong.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">🎵</span>
        )}
      </div>

      {/* Song info */}
      <div className="min-w-0 flex-1 hidden sm:block">
        <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
          {currentSong.title || currentSong.name}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {currentSong.artist || 'Unknown Artist'}
        </p>
        {queue.length > 1 && (
          <p className="text-xs text-gray-500">
            {currentIndex + 1} / {queue.length}
          </p>
        )}
      </div>
    </Link>
  );
};
