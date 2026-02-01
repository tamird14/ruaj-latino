import { useState } from 'react';
import { Eye, EyeOff, Lock, Globe } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useUIStore, usePlaylistStore } from '../../store';

export const CreatePlaylistModal = () => {
  const { isCreatePlaylistModalOpen, closeCreatePlaylistModal, addToast } = useUIStore();
  const { createPlaylist, isLoading } = usePlaylistStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a playlist name');
      return;
    }

    try {
      await createPlaylist({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
        password: password.trim() || undefined,
      });

      addToast('Playlist created successfully', 'success');
      handleClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setIsPublic(true);
    setPassword('');
    setError('');
    closeCreatePlaylistModal();
  };

  return (
    <Modal
      isOpen={isCreatePlaylistModalOpen}
      onClose={handleClose}
      title="Create New Playlist"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="My awesome playlist"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-none"
            placeholder="Optional description..."
            rows={2}
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Visibility
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                isPublic
                  ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                  : 'border-dark-700 text-gray-400 hover:border-dark-600'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Public</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                !isPublic
                  ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                  : 'border-dark-700 text-gray-400 hover:border-dark-600'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span>Private</span>
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="playlist-password" className="block text-sm font-medium text-gray-300 mb-2">
            <Lock className="w-4 h-4 inline mr-1" />
            Password protection (optional)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="playlist-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
              placeholder="Leave empty for no password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            If set, a password will be required to edit or delete this playlist
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
