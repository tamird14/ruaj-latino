import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  // Modals
  isPasswordModalOpen: boolean;
  passwordModalPlaylistId: string | null;
  passwordModalAction: 'view' | 'edit' | 'delete' | null;
  passwordModalCallback: ((password: string) => void) | null;

  isCreatePlaylistModalOpen: boolean;

  // Add to Playlist modal
  isAddToPlaylistModalOpen: boolean;
  addToPlaylistSongIds: string[];

  // Save Queue as Playlist modal
  isSaveQueueModalOpen: boolean;

  // Toasts
  toasts: Toast[];

  // Actions
  openPasswordModal: (playlistId: string, action: 'view' | 'edit' | 'delete', callback: (password: string) => void) => void;
  closePasswordModal: () => void;
  openCreatePlaylistModal: () => void;
  closeCreatePlaylistModal: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  openAddToPlaylistModal: (songIds: string[]) => void;
  closeAddToPlaylistModal: () => void;
  openSaveQueueModal: () => void;
  closeSaveQueueModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isPasswordModalOpen: false,
  passwordModalPlaylistId: null,
  passwordModalAction: null,
  passwordModalCallback: null,
  isCreatePlaylistModalOpen: false,
  isAddToPlaylistModalOpen: false,
  addToPlaylistSongIds: [],
  isSaveQueueModalOpen: false,
  toasts: [],

  openPasswordModal: (playlistId, action, callback) =>
    set({
      isPasswordModalOpen: true,
      passwordModalPlaylistId: playlistId,
      passwordModalAction: action,
      passwordModalCallback: callback,
    }),

  closePasswordModal: () =>
    set({
      isPasswordModalOpen: false,
      passwordModalPlaylistId: null,
      passwordModalAction: null,
      passwordModalCallback: null,
    }),

  openCreatePlaylistModal: () => set({ isCreatePlaylistModalOpen: true }),
  closeCreatePlaylistModal: () => set({ isCreatePlaylistModalOpen: false }),

  addToast: (message, type) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openAddToPlaylistModal: (songIds) =>
    set({ isAddToPlaylistModalOpen: true, addToPlaylistSongIds: songIds }),
  closeAddToPlaylistModal: () =>
    set({ isAddToPlaylistModalOpen: false, addToPlaylistSongIds: [] }),

  openSaveQueueModal: () => set({ isSaveQueueModalOpen: true }),
  closeSaveQueueModal: () => set({ isSaveQueueModalOpen: false }),
}));
