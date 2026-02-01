import { Link } from 'react-router-dom';
import { Play, Lock, Globe, Music } from 'lucide-react';
import type { Playlist } from '@ruaj-latino/shared';
import { useQueueStore, usePlaylistStore, useUIStore } from '../../store';

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  const { setQueue } = useQueueStore();
  const { fetchPlaylist } = usePlaylistStore();
  const { openPasswordModal, addToast } = useUIStore();

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const playPlaylist = async (password?: string) => {
      try {
        const fullPlaylist = await fetchPlaylist(playlist.id, password);
        if (fullPlaylist) {
          const songs = fullPlaylist.songs.map((ps) => ps.song);
          if (songs.length > 0) {
            setQueue(songs);
          } else {
            addToast('This playlist is empty', 'info');
          }
        }
      } catch (err) {
        addToast((err as Error).message, 'error');
      }
    };

    if (playlist.isProtected) {
      openPasswordModal(playlist.id, 'view', playPlaylist);
    } else {
      playPlaylist();
    }
  };

  return (
    <Link
      to={`/playlists/${playlist.id}`}
      className="card-hover group relative"
    >
      {/* Cover */}
      <div className="aspect-square bg-dark-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
        {playlist.coverImageUrl ? (
          <img
            src={playlist.coverImageUrl}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Music className="w-12 h-12 text-gray-600" />
        )}

        {/* Play button overlay */}
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:scale-105"
        >
          <Play className="w-5 h-5 text-white" fill="white" />
        </button>
      </div>

      {/* Info */}
      <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
        {playlist.name}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        {playlist.isProtected && (
          <Lock className="w-3 h-3 text-gray-500" />
        )}
        {playlist.isPublic ? (
          <Globe className="w-3 h-3 text-gray-500" />
        ) : (
          <span className="text-xs text-gray-500">Private</span>
        )}
        <span className="text-sm text-gray-400">
          {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
        </span>
      </div>
      {playlist.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {playlist.description}
        </p>
      )}
    </Link>
  );
};
