import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Shuffle, Trash2, Lock, Globe, ArrowLeft, Pencil,
  Eye, EyeOff, GripVertical, X, ArrowUpDown, Music,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePlaylistStore, useQueueStore, useUIStore } from '../store';
import { FileCard } from '../components/browser/FileCard';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { formatDuration } from '../utils/formatters';
import type { Song } from '@ruaj-latino/shared';

// --- Sortable song row for reorder mode ---

interface SortablePlaylistSongProps {
  song: Song;
  index: number;
  onRemove: () => void;
}

const SortablePlaylistSong = ({ song, index, onRemove }: SortablePlaylistSongProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 rounded-lg group hover:bg-dark-800 card border border-dark-800/80"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-2 min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Index */}
      <div className="w-8 text-center">
        <span className="text-sm text-gray-500">{index + 1}</span>
      </div>

      {/* Thumbnail */}
      <div className="w-10 h-10 bg-dark-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
        {song.thumbnailUrl ? (
          <img src={song.thumbnailUrl} alt={song.title || song.name} className="w-full h-full object-cover" />
        ) : (
          <Music className="w-4 h-4 text-gray-600" />
        )}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {song.title || song.name}
        </p>
        <p className="text-sm text-gray-400 truncate">
          {song.artist || 'Unknown Artist'}
        </p>
      </div>

      {/* Duration */}
      {song.duration && (
        <span className="text-sm text-gray-500 tabular-nums hidden sm:block">
          {formatDuration(song.duration)}
        </span>
      )}

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10"
        title="Remove from playlist"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- Main component ---

export const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPlaylist, isLoading, error, fetchPlaylist, deletePlaylist, reorderSongs, removeSongFromPlaylist } = usePlaylistStore();
  const { setQueue } = useQueueStore();
  const { updatePlaylist } = usePlaylistStore();
  const { openPasswordModal, addToast } = useUIStore();
  const [playlistPassword, setPlaylistPassword] = useState<string | undefined>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editPassword, setEditPassword] = useState('');
  const [removePassword, setRemovePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editError, setEditError] = useState('');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      fetchPlaylist(id);
    }
  }, [id, fetchPlaylist]);

  const songs = useMemo(
    () => currentPlaylist?.songs.map((ps) => ps.song) ?? [],
    [currentPlaylist]
  );

  const songIds = useMemo(() => songs.map((s) => s.id), [songs]);

  const handlePlay = () => {
    if (!currentPlaylist) return;

    if (songs.length === 0) {
      addToast('This playlist is empty', 'info');
      return;
    }
    setQueue(songs);
    addToast(`Playing: ${currentPlaylist.name}`, 'info');
  };

  const handleShuffle = () => {
    if (!currentPlaylist) return;

    if (songs.length === 0) {
      addToast('This playlist is empty', 'info');
      return;
    }

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

  const handleToggleReorderMode = () => {
    if (!currentPlaylist || !id) return;

    if (!isReorderMode && currentPlaylist.isProtected && !playlistPassword) {
      openPasswordModal(id, 'edit', (password) => {
        setPlaylistPassword(password);
        setIsReorderMode(true);
      });
      return;
    }
    setIsReorderMode(!isReorderMode);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !id) return;

    const oldIndex = songIds.indexOf(active.id as string);
    const newIndex = songIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    // Build the new order
    const newSongIds = [...songIds];
    const [removed] = newSongIds.splice(oldIndex, 1);
    newSongIds.splice(newIndex, 0, removed);

    try {
      await reorderSongs(id, newSongIds, playlistPassword);
    } catch (err) {
      addToast((err as Error).message, 'error');
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!id) return;

    const doRemove = async (password?: string) => {
      try {
        await removeSongFromPlaylist(id, songId, password);
        addToast('Song removed from playlist', 'success');
      } catch (err) {
        addToast((err as Error).message, 'error');
      }
    };

    if (currentPlaylist?.isProtected && !playlistPassword) {
      openPasswordModal(id, 'edit', (password) => {
        setPlaylistPassword(password);
        doRemove(password);
      });
    } else {
      doRemove(playlistPassword);
    }
  };

  const openEditModal = (password?: string) => {
    if (!currentPlaylist || !id) return;
    if (password) {
      setPlaylistPassword(password);
    }
    setEditName(currentPlaylist.name);
    setEditDescription(currentPlaylist.description ?? '');
    setEditIsPublic(currentPlaylist.isPublic);
    setEditPassword('');
    setRemovePassword(false);
    setShowEditPassword(false);
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditClick = () => {
    if (!currentPlaylist || !id) return;
    if (currentPlaylist.isProtected && !playlistPassword) {
      openPasswordModal(id, 'edit', (password) => openEditModal(password));
      return;
    }
    openEditModal();
  };

  const handleUpdatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlaylist || !id) return;

    const trimmedName = editName.trim();
    const trimmedDescription = editDescription.trim();
    const trimmedPassword = editPassword.trim();
    setEditError('');

    if (!trimmedName) {
      setEditError('Playlist name is required');
      return;
    }

    if (trimmedPassword && trimmedPassword.length < 4) {
      setEditError('Password must be at least 4 characters');
      return;
    }

    if (removePassword && trimmedPassword) {
      setEditError('Choose either "remove password" or set a new one');
      return;
    }

    try {
      await updatePlaylist(
        id,
        {
          name: trimmedName,
          description: trimmedDescription,
          isPublic: editIsPublic,
          password: trimmedPassword || undefined,
          removePassword,
        },
        playlistPassword
      );

      if (removePassword) {
        setPlaylistPassword(undefined);
      } else if (trimmedPassword) {
        setPlaylistPassword(trimmedPassword);
      }

      addToast('Playlist updated', 'success');
      setIsEditModalOpen(false);
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes('Password') && currentPlaylist.isProtected) {
        openPasswordModal(id, 'edit', async (password) => {
          setPlaylistPassword(password);
          try {
            await updatePlaylist(
              id,
              {
                name: trimmedName,
                description: trimmedDescription,
                isPublic: editIsPublic,
                password: trimmedPassword || undefined,
                removePassword,
              },
              password
            );
            if (removePassword) {
              setPlaylistPassword(undefined);
            } else if (trimmedPassword) {
              setPlaylistPassword(trimmedPassword);
            }
            addToast('Playlist updated', 'success');
            setIsEditModalOpen(false);
          } catch (retryError) {
            setEditError((retryError as Error).message);
          }
        });
      } else {
        setEditError(message);
      }
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

  return (
    <div className="space-y-6 min-w-0 w-full max-w-full overflow-x-hidden">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="card flex flex-col md:flex-row gap-6 min-w-0 overflow-hidden">
        {/* Cover */}
        <div className="w-full max-w-[12rem] h-48 bg-dark-800 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
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
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-2 min-w-0">
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

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 break-words">
            {currentPlaylist.name}
          </h1>

          {currentPlaylist.description && (
            <p className="text-gray-400 mb-4 break-words">{currentPlaylist.description}</p>
          )}

          <p className="text-sm text-gray-500 mb-4">
            {currentPlaylist.songCount} {currentPlaylist.songCount === 1 ? 'song' : 'songs'}
          </p>

          {/* Actions */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handlePlay}
              className="btn-primary w-full sm:w-auto justify-center"
              disabled={songs.length === 0}
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Play
            </button>

            <button
              onClick={handleShuffle}
              className="btn-secondary w-full sm:w-auto justify-center"
              disabled={songs.length === 0}
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>

            <button onClick={handleEditClick} className="btn-secondary w-full sm:w-auto justify-center">
              <Pencil className="w-4 h-4" />
              Edit
            </button>

            <button onClick={handleDelete} className="btn-ghost w-full sm:w-auto justify-center text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Songs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Songs</h2>
          {songs.length > 1 && (
            <button
              onClick={handleToggleReorderMode}
              className={`btn-secondary text-sm ${
                isReorderMode ? 'bg-primary-500/20 border-primary-500/40 text-primary-400' : ''
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              {isReorderMode ? 'Done' : 'Edit Order'}
            </button>
          )}
        </div>

        {songs.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400">This playlist is empty</p>
            <p className="text-sm text-gray-500 mt-1">
              Browse music and add songs to this playlist
            </p>
          </div>
        ) : isReorderMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={songIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {songs.map((song, index) => (
                  <SortablePlaylistSong
                    key={song.id}
                    song={song}
                    index={index}
                    onRemove={() => handleRemoveSong(song.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Playlist"
      >
        <form onSubmit={handleUpdatePlaylist} className="space-y-4">
          <div>
            <label htmlFor="edit-playlist-name" className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              id="edit-playlist-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input"
              placeholder="Playlist name"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="edit-playlist-description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="edit-playlist-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="input resize-none"
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Visibility</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditIsPublic(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  editIsPublic
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                    : 'border-dark-700 text-gray-400 hover:border-dark-600'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Public</span>
              </button>
              <button
                type="button"
                onClick={() => setEditIsPublic(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  !editIsPublic
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                    : 'border-dark-700 text-gray-400 hover:border-dark-600'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span>Private</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="edit-playlist-password" className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              New password (optional)
            </label>
            <div className="relative">
              <input
                id="edit-playlist-password"
                type={showEditPassword ? 'text' : 'password'}
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="input pr-10"
                placeholder="Leave empty to keep current password"
              />
              <button
                type="button"
                onClick={() => setShowEditPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Set a new password to replace the current one.
            </p>
          </div>

          {currentPlaylist?.isProtected && (
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={removePassword}
                onChange={(e) => setRemovePassword(e.target.checked)}
                className="rounded border-dark-700 bg-dark-800"
              />
              Remove current password
            </label>
          )}

          {editError && (
            <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
              {editError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
