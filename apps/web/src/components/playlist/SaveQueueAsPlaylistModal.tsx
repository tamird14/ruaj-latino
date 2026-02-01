import { useState, useEffect } from 'react';
import { Lock, Music, Check, Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useUIStore, usePlaylistStore, useQueueStore } from '../../store';

type Mode = 'select' | 'create';

export const SaveQueueAsPlaylistModal = () => {
  const { isSaveQueueModalOpen, closeSaveQueueModal, addToast, openPasswordModal } = useUIStore();
  const { playlists, fetchPlaylists, addSongsToPlaylist, createPlaylist, isLoading } = usePlaylistStore();
  const { queue } = useQueueStore();

  const [mode, setMode] = useState<Mode>('select');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch playlists when modal opens
  useEffect(() => {
    if (isSaveQueueModalOpen) {
      fetchPlaylists();
      setMode('select');
      setSelectedPlaylistId(null);
      setNewPlaylistName('');
      setError('');
    }
  }, [isSaveQueueModalOpen, fetchPlaylists]);

  const songIds = queue.map((song) => song.id);

  const handleSaveToExisting = async () => {
    if (!selectedPlaylistId || songIds.length === 0) return;

    const playlist = playlists.find((p) => p.id === selectedPlaylistId);
    if (!playlist) return;

    setIsSaving(true);
    setError('');

    const doSave = async (password?: string) => {
      try {
        await addSongsToPlaylist(selectedPlaylistId, songIds, password);
        addToast(`Added ${songIds.length} songs to "${playlist.name}"`, 'success');
        closeSaveQueueModal();
      } catch (err) {
        setError((err as Error).message);
        setIsSaving(false);
      }
    };

    if (playlist.isProtected) {
      openPasswordModal(selectedPlaylistId, 'edit', (password) => {
        doSave(password);
      });
      setIsSaving(false);
    } else {
      await doSave();
      setIsSaving(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newPlaylistName.trim() || songIds.length === 0) return;

    setIsSaving(true);
    setError('');

    try {
      // Create playlist first without songs (to avoid UUID validation issues with Drive IDs)
      const playlist = await createPlaylist({
        name: newPlaylistName.trim(),
      });
      // Then add songs separately
      await addSongsToPlaylist(playlist.id, songIds);
      addToast(`Created playlist "${newPlaylistName}" with ${songIds.length} songs`, 'success');
      closeSaveQueueModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setMode('select');
    setSelectedPlaylistId(null);
    setNewPlaylistName('');
    setError('');
    closeSaveQueueModal();
  };

  return (
    <Modal
      isOpen={isSaveQueueModalOpen}
      onClose={handleClose}
      title={`Save ${queue.length} songs to playlist`}
    >
      <div className="space-y-4">
        {/* Mode tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('select')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'select'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                : 'bg-dark-800 text-gray-400 border border-dark-700 hover:border-dark-600'
            }`}
          >
            Add to existing
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'create'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                : 'bg-dark-800 text-gray-400 border border-dark-700 hover:border-dark-600'
            }`}
          >
            Create new
          </button>
        </div>

        {mode === 'select' ? (
          // Existing playlist selection
          <>
            {isLoading && playlists.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Loading playlists...</div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No playlists yet</p>
                <button
                  onClick={() => setMode('create')}
                  className="mt-3 text-primary-400 hover:text-primary-300 text-sm"
                >
                  Create your first playlist
                </button>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {playlists.map((playlist) => {
                  const isSelected = selectedPlaylistId === playlist.id;
                  return (
                    <button
                      key={playlist.id}
                      onClick={() => setSelectedPlaylistId(playlist.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                        isSelected
                          ? 'bg-primary-500/10 border-primary-500'
                          : 'border-dark-700 hover:border-dark-600 hover:bg-dark-800'
                      }`}
                    >
                      {/* Radio */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
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
          </>
        ) : (
          // Create new playlist
          <div>
            <label htmlFor="new-playlist-name" className="block text-sm font-medium text-gray-300 mb-2">
              Playlist name
            </label>
            <input
              type="text"
              id="new-playlist-name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="input"
              placeholder="My awesome playlist"
              autoFocus
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">
            Cancel
          </button>
          {mode === 'select' ? (
            <button
              onClick={handleSaveToExisting}
              className="btn-primary flex-1"
              disabled={!selectedPlaylistId || isSaving}
            >
              {isSaving ? 'Adding...' : 'Add to Playlist'}
            </button>
          ) : (
            <button
              onClick={handleCreateNew}
              className="btn-primary flex-1"
              disabled={!newPlaylistName.trim() || isSaving}
            >
              <Plus className="w-4 h-4" />
              {isSaving ? 'Creating...' : 'Create Playlist'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
