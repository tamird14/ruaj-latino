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
    <div className="space-y-8 md:space-y-10">
      {/* Welcome section */}
      <section className="relative overflow-hidden card p-6 md:p-8 lg:p-10 bg-gradient-to-br from-[#2A1538] via-[#1A1B3A] to-dark-950 border-primary-500/20">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-16 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-300/80 mb-3">Made For You</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            Welcome to <span className="text-gradient">Ruaj Latino</span>
          </h1>
          <p className="text-gray-300 max-w-2xl text-sm md:text-base">
            Stream music from your shared collection with a polished desktop player experience.
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-3">Quick Access</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/browse"
          className="card-hover flex items-center gap-4 p-5"
        >
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center ring-1 ring-primary-500/20">
            <FolderOpen className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Browse</p>
            <p className="text-sm text-gray-300">Explore all songs</p>
          </div>
        </Link>

        <Link
          to="/playlists"
          className="card-hover flex items-center gap-4 p-5"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center ring-1 ring-green-500/20">
            <ListMusic className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Playlists</p>
            <p className="text-sm text-gray-300">{playlists.length} available</p>
          </div>
        </Link>

        <Link
          to="/queue"
          className="card-hover flex items-center gap-4 p-5"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center ring-1 ring-blue-500/20">
            <Music className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Queue</p>
            <p className="text-sm text-gray-300">{queue.length} songs</p>
          </div>
        </Link>
        </div>
      </section>

      {/* Recent playlists */}
      <section className="card p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-1">Listen Now</p>
            <h2 className="text-2xl font-bold text-white">Public Playlists</h2>
          </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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

      {/* Instructions - desktop only */}
      <section className="hidden md:block card bg-dark-900/65">
        <h3 className="font-semibold text-white mb-3">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 text-sm">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-dark-800/40 border border-dark-700/60">
            <kbd className="px-2 py-1 bg-dark-800 rounded text-gray-300 border border-dark-700">Space</kbd>
            <span className="text-gray-400">Play/Pause</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-dark-800/40 border border-dark-700/60">
            <kbd className="px-2 py-1 bg-dark-800 rounded text-gray-300 border border-dark-700">←/→</kbd>
            <span className="text-gray-400">Seek ±5s</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-dark-800/40 border border-dark-700/60">
            <kbd className="px-2 py-1 bg-dark-800 rounded text-gray-300 border border-dark-700">Shift+←/→</kbd>
            <span className="text-gray-400">Prev/Next</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-dark-800/40 border border-dark-700/60">
            <kbd className="px-2 py-1 bg-dark-800 rounded text-gray-300 border border-dark-700">↑/↓</kbd>
            <span className="text-gray-400">Volume</span>
          </div>
        </div>
      </section>
    </div>
  );
};
