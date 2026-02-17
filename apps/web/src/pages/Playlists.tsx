import { useEffect } from 'react';
import { Plus, ListMusic } from 'lucide-react';
import { usePlaylistStore, useUIStore } from '../store';
import { PlaylistCard } from '../components/playlist/PlaylistCard';
import { Loading } from '../components/common/Loading';

export const Playlists = () => {
  const { playlists, isLoading, fetchPlaylists } = usePlaylistStore();
  const { openCreatePlaylistModal } = useUIStore();

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const publicPlaylists = playlists.filter((p) => p.isPublic);
  const privatePlaylists = playlists.filter((p) => !p.isPublic);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Playlists</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {playlists.length} playlists
          </p>
        </div>

        <button onClick={openCreatePlaylistModal} className="btn-primary flex-shrink-0 touch-manipulation">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Playlist</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {isLoading ? (
        <Loading text="Loading playlists..." />
      ) : playlists.length === 0 ? (
        <div className="card text-center py-12">
          <ListMusic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No playlists yet</p>
          <p className="text-sm text-gray-500 mt-2 mb-4">
            Create your first playlist to organize your music
          </p>
          <button onClick={openCreatePlaylistModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            Create Playlist
          </button>
        </div>
      ) : (
        <>
          {/* Public playlists */}
          {publicPlaylists.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">
                Public Playlists
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {publicPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}

          {/* Private playlists */}
          {privatePlaylists.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">
                Private Playlists
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {privatePlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
