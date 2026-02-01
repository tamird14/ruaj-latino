import { useState, useEffect } from 'react';
import { Lock, Music, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useUIStore, usePlaylistStore } from '../../store';

export const AddToPlaylistModal = () => {
  const { isAddToPlaylistModalOpen, addToPlaylistSongIds, closeAddToPlaylistModal, addToast, openPasswordModal } = useUIStore();
  const { playlists, fetchPlaylists, addSongsToPlaylist, isLoading } = usePlaylistStore();

  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  // Fetch playlists when modal opens
  useEffect(() => {
    if (isAddToPlaylistModalOpen) {
      fetchPlaylists();
      setSelectedPlaylistIds(new Set());
    }
  }, [isAddToPlaylistModalOpen, fetchPlaylists]);

  const togglePlaylist = (playlistId: string) => {
    setSelectedPlaylistIds((prev) => {
      const next = new Set(prev);
      if (next.has(playlistId)) {
        next.delete(playlistId);
      } else {
        next.add(playlistId);
      }
      return next;
    });
  };

  const handleAdd = async () => {
    if (selectedPlaylistIds.size === 0 || addToPlaylistSongIds.length === 0) return;

    setIsAdding(true);
    let successCount = 0;
    let errorCount = 0;

    for (const playlistId of selectedPlaylistIds) {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) continue;

      if (playlist.isProtected) {
        // Handle password-protected playlist
        openPasswordModal(playlistId, 'edit', async (password) => {
          try {
            await addSongsToPlaylist(playlistId, addToPlaylistSongIds, password);
            successCount++;
          } catch {
            errorCount++;
          }
        });
      } else {
        try {
          await addSongsToPlaylist(playlistId, addToPlaylistSongIds);
          successCount++;
        } catch {
          errorCount++;
        }
      }
    }

    setIsAdding(false);

    // Show feedback
    const songText = addToPlaylistSongIds.length === 1 ? 'song' : 'songs';
    if (successCount > 0) {
      addToast(`Added ${addToPlaylistSongIds.length} ${songText} to ${successCount} playlist${successCount > 1 ? 's' : ''}`, 'success');
    }
    if (errorCount > 0) {
      addToast(`Failed to add to ${errorCount} playlist${errorCount > 1 ? 's' : ''}`, 'error');
    }

    closeAddToPlaylistModal();
  };

  const handleClose = () => {
    setSelectedPlaylistIds(new Set());
    closeAddToPlaylistModal();
  };

  const songCount = addToPlaylistSongIds.length;

  return (
    <Modal
      isOpen={isAddToPlaylistModalOpen}
      onClose={handleClose}
      title={`Add ${songCount} ${songCount === 1 ? 'song' : 'songs'} to playlist`}
    >
      <div className="space-y-4">
        {/* Playlist list */}
        {isLoading && playlists.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Loading playlists...</div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-8">
            <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No playlists yet</p>
            <p className="text-sm text-gray-500 mt-1">Create a playlist first</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {playlists.map((playlist) => {
              const isSelected = selectedPlaylistIds.has(playlist.id);
              return (
                <button
                  key={playlist.id}
                  onClick={() => togglePlaylist(playlist.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500'
                      : 'border-dark-700 hover:border-dark-600 hover:bg-dark-800'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-gray-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Playlist info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">{playlist.name}</span>
                      {playlist.isProtected && (
                        <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="btn-primary flex-1"
            disabled={selectedPlaylistIds.size === 0 || isAdding}
          >
            {isAdding ? 'Adding...' : `Add to ${selectedPlaylistIds.size || ''} Playlist${selectedPlaylistIds.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};
