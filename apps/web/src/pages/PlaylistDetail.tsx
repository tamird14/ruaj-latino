import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Trash2, Lock, Globe, ArrowLeft } from 'lucide-react';
import { usePlaylistStore, useQueueStore, useUIStore } from '../store';
import { FileCard } from '../components/browser/FileCard';
import { Loading } from '../components/common/Loading';

export const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPlaylist, isLoading, error, fetchPlaylist, deletePlaylist } = usePlaylistStore();
  const { setQueue } = useQueueStore();
  const { openPasswordModal, addToast } = useUIStore();
  const [_playlistPassword, setPlaylistPassword] = useState<string | undefined>();

  useEffect(() => {
    if (id) {
      fetchPlaylist(id);
    }
  }, [id, fetchPlaylist]);

  const handlePlay = () => {
    if (!currentPlaylist) return;

    const songs = currentPlaylist.songs.map((ps) => ps.song);
    if (songs.length === 0) {
      addToast('This playlist is empty', 'info');
      return;
    }
    setQueue(songs);
    addToast(`Playing: ${currentPlaylist.name}`, 'info');
  };

  const handleShuffle = () => {
    if (!currentPlaylist) return;

    const songs = currentPlaylist.songs.map((ps) => ps.song);
    if (songs.length === 0) {
      addToast('This playlist is empty', 'info');
      return;
    }

    // Shuffle the songs
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    addToast(`Shuffling: ${currentPlaylist.name}`, 'info');
  };

  const handleDelete = () => {
    if (!currentPlaylist || !id) return;

    const doDelete = async (password?: string) => {
      try {
        await deletePlaylist(id, password);
        addToast('Playlist deleted', 'success');
        navigate('/playlists');
      } catch (err) {
        addToast((err as Error).message, 'error');
      }
    };

    if (currentPlaylist.isProtected) {
      openPasswordModal(id, 'delete', doDelete);
    } else if (confirm('Are you sure you want to delete this playlist?')) {
      doDelete();
    }
  };

  if (isLoading) {
    return <Loading text="Loading playlist..." />;
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        {error.includes('password') && currentPlaylist?.isProtected && (
          <button
            onClick={() => {
              if (id) {
                openPasswordModal(id, 'view', (password) => {
                  setPlaylistPassword(password);
                  fetchPlaylist(id, password);
                });
              }
            }}
            className="btn-primary"
          >
            <Lock className="w-4 h-4" />
            Enter Password
          </button>
        )}
      </div>
    );
  }

  if (!currentPlaylist) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Playlist not found</p>
      </div>
    );
  }

  const songs = currentPlaylist.songs.map((ps) => ps.song);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="card flex flex-col md:flex-row gap-6">
        {/* Cover */}
        <div className="w-48 h-48 bg-dark-800 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
          {currentPlaylist.coverImageUrl ? (
            <img
              src={currentPlaylist.coverImageUrl}
              alt={currentPlaylist.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-6xl">🎵</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            {currentPlaylist.isPublic ? (
              <>
                <Globe className="w-4 h-4" />
                Public Playlist
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Private Playlist
              </>
            )}
            {currentPlaylist.isProtected && (
              <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs">
                Password Protected
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">{currentPlaylist.name}</h1>

          {currentPlaylist.description && (
            <p className="text-gray-400 mb-4">{currentPlaylist.description}</p>
          )}

          <p className="text-sm text-gray-500 mb-4">
            {currentPlaylist.songCount} {currentPlaylist.songCount === 1 ? 'song' : 'songs'}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePlay}
              className="btn-primary"
              disabled={songs.length === 0}
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Play
            </button>

            <button
              onClick={handleShuffle}
              className="btn-secondary"
              disabled={songs.length === 0}
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>

            <button onClick={handleDelete} className="btn-ghost text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Songs */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Songs</h2>

        {songs.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400">This playlist is empty</p>
            <p className="text-sm text-gray-500 mt-1">
              Browse music and add songs to this playlist
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {songs.map((song, index) => (
              <FileCard
                key={song.id}
                file={song}
                playlistSongs={songs}
                playlistIndex={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
