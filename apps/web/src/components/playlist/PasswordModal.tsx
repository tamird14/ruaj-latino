import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useUIStore } from '../../store';

export const PasswordModal = () => {
  const {
    isPasswordModalOpen,
    passwordModalAction,
    passwordModalCallback,
    closePasswordModal,
  } = useUIStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (passwordModalCallback) {
      passwordModalCallback(password);
    }

    setPassword('');
    closePasswordModal();
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    closePasswordModal();
  };

  const actionText = {
    view: 'view this playlist',
    edit: 'edit this playlist',
    delete: 'delete this playlist',
  };

  return (
    <Modal
      isOpen={isPasswordModalOpen}
      onClose={handleClose}
      title="Password Required"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-dark-800 rounded-lg">
          <Lock className="w-5 h-5 text-primary-400" />
          <p className="text-sm text-gray-300">
            This playlist is protected. Enter the password to{' '}
            {passwordModalAction && actionText[passwordModalAction]}.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Enter playlist password"
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1">
            Confirm
          </button>
        </div>
      </form>
    </Modal>
  );
};
