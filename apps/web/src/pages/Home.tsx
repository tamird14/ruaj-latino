import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Music, ListMusic, FolderOpen } from 'lucide-react';
import { usePlaylistStore, useQueueStore } from '../store';
import { PlaylistCard } from '../components/playlist/PlaylistCard';
import { Loading } from '../components/common/Loading';

export const Home = () => {
  const { playlists, isLoading, fetchPlaylists } = usePlaylistStore();
  const { queue } = useQueueStore();

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const recentPlaylists = playlists.filter((p) => p.isPublic).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to <span className="text-gradient">Ruaj Latino</span>
        </h1>
        <p className="text-gray-400">
          Stream music from your shared collection
        </p>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          to="/browse"
          className="card-hover flex items-center gap-4 p-4"
        >
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Browse</p>
            <p className="text-sm text-gray-400">Explore all songs</p>
          </div>
        </Link>

        <Link
          to="/playlists"
          className="card-hover flex items-center gap-4 p-4"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <ListMusic className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Playlists</p>
            <p className="text-sm text-gray-400">{playlists.length} available</p>
          </div>
        </Link>

        <Link
          to="/queue"
          className="card-hover flex items-center gap-4 p-4"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Queue</p>
            <p className="text-sm text-gray-400">{queue.length} songs</p>
          </div>
        </Link>
      </section>

      {/* Recent playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Public Playlists</h2>
          <Link
            to="/playlists"
            className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            See all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <Loading text="Loading playlists..." />
        ) : recentPlaylists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <ListMusic className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No playlists yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Create your first playlist to get started
            </p>
          </div>
        )}
      </section>

      {/* Instructions */}
      <section className="card bg-dark-900/50">
        <h3 className="font-semibold text-white mb-3">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-dark-800 rounded text-gray-300">Space</kbd>
            <span className="text-gray-400">Play/Pause</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-dark-800 rounded text-gray-300">←/→</kbd>
            <span className="text-gray-400">Seek ±5s</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-dark-800 rounded text-gray-300">Shift+←/→</kbd>
            <span className="text-gray-400">Prev/Next</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-dark-800 rounded text-gray-300">↑/↓</kbd>
            <span className="text-gray-400">Volume</span>
          </div>
        </div>
      </section>
    </div>
  );
};
