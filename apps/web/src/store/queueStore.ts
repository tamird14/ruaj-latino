import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song } from '@ruaj-latino/shared';
import { usePlayerStore } from './playerStore';

export type RepeatMode = 'none' | 'one' | 'all';

interface QueueState {
  // Queue data
  queue: Song[];
  originalQueue: Song[]; // For shuffle reset
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: RepeatMode;

  // Actions
  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (songs: Song[]) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  next: () => void;
  previous: () => void;
  goToIndex: (index: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  resetPlaylist: () => void;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      originalQueue: [],
      currentIndex: 0,
      isShuffled: false,
      repeatMode: 'none',

      setQueue: (songs, startIndex = 0) => {
        set({
          queue: songs,
          originalQueue: songs,
          currentIndex: startIndex,
          isShuffled: false,
        });
        const song = songs[startIndex];
        if (song) {
          usePlayerStore.getState().setCurrentSong(song);
          usePlayerStore.getState().play();
        }
      },

      addToQueue: (songs) => {
        set((state) => ({
          queue: [...state.queue, ...songs],
          originalQueue: [...state.originalQueue, ...songs],
        }));
      },

      removeFromQueue: (index) => {
        const { currentIndex } = get();
        const playerStore = usePlayerStore.getState();

        // Don't allow removing current song if playing
        if (index === currentIndex && playerStore.isPlaying) {
          return;
        }

        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index);
          let newIndex = state.currentIndex;

          if (index < currentIndex) {
            newIndex = currentIndex - 1;
          } else if (index === currentIndex && newQueue.length > 0) {
            newIndex = Math.min(currentIndex, newQueue.length - 1);
            // Update current song if we removed it
            const newSong = newQueue[newIndex];
            if (newSong) {
              usePlayerStore.getState().setCurrentSong(newSong);
            }
          }

          return {
            queue: newQueue,
            originalQueue: state.originalQueue.filter((_, i) => i !== index),
            currentIndex: Math.max(0, newIndex),
          };
        });
      },

      reorderQueue: (fromIndex, toIndex) => {
        const { currentIndex } = get();
        const playerStore = usePlayerStore.getState();

        // Don't allow reordering current song if playing
        if (fromIndex === currentIndex && playerStore.isPlaying) {
          return;
        }

        set((state) => {
          const newQueue = [...state.queue];
          const [removed] = newQueue.splice(fromIndex, 1);
          newQueue.splice(toIndex, 0, removed);

          // Adjust current index
          let newIndex = state.currentIndex;
          if (fromIndex === currentIndex) {
            newIndex = toIndex;
          } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
            newIndex = currentIndex - 1;
          } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
            newIndex = currentIndex + 1;
          }

          return { queue: newQueue, currentIndex: newIndex };
        });
      },

      clearQueue: () => {
        set({ queue: [], originalQueue: [], currentIndex: 0 });
        usePlayerStore.getState().stop();
        usePlayerStore.getState().setCurrentSong(null);
      },

      next: () => {
        const { queue, currentIndex, repeatMode } = get();

        if (repeatMode === 'one') {
          usePlayerStore.getState().restart();
          return;
        }

        let nextIndex = currentIndex + 1;

        if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            usePlayerStore.getState().stop();
            return;
          }
        }

        set({ currentIndex: nextIndex });
        const song = queue[nextIndex];
        if (song) {
          usePlayerStore.getState().setCurrentSong(song);
          usePlayerStore.getState().play();
        }
      },

      previous: () => {
        const { queue, currentIndex, repeatMode } = get();
        const playerStore = usePlayerStore.getState();

        // If more than 3 seconds into song, restart instead
        if (playerStore.currentTime > 3) {
          playerStore.restart();
          return;
        }

        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
          if (repeatMode === 'all') {
            prevIndex = queue.length - 1;
          } else {
            playerStore.restart();
            return;
          }
        }

        set({ currentIndex: prevIndex });
        const song = queue[prevIndex];
        if (song) {
          playerStore.setCurrentSong(song);
          playerStore.play();
        }
      },

      goToIndex: (index) => {
        const { queue } = get();
        if (index >= 0 && index < queue.length) {
          set({ currentIndex: index });
          const song = queue[index];
          if (song) {
            usePlayerStore.getState().setCurrentSong(song);
            usePlayerStore.getState().play();
          }
        }
      },

      toggleShuffle: () => {
        set((state) => {
          if (state.isShuffled) {
            // Restore original order
            const currentSong = state.queue[state.currentIndex];
            const newIndex = state.originalQueue.findIndex(
              (s) => s.id === currentSong?.id
            );
            return {
              queue: state.originalQueue,
              currentIndex: newIndex >= 0 ? newIndex : 0,
              isShuffled: false,
            };
          } else {
            // Shuffle (keeping current song at position 0)
            const currentSong = state.queue[state.currentIndex];
            const otherSongs = state.queue.filter((_, i) => i !== state.currentIndex);
            const shuffled = [...otherSongs].sort(() => Math.random() - 0.5);
            return {
              queue: currentSong ? [currentSong, ...shuffled] : shuffled,
              currentIndex: 0,
              isShuffled: true,
            };
          }
        });
      },

      cycleRepeat: () => {
        set((state) => ({
          repeatMode:
            state.repeatMode === 'none'
              ? 'all'
              : state.repeatMode === 'all'
              ? 'one'
              : 'none',
        }));
      },

      resetPlaylist: () => {
        const { originalQueue } = get();
        set({
          queue: originalQueue,
          currentIndex: 0,
          isShuffled: false,
        });
        usePlayerStore.getState().stop();
        const firstSong = originalQueue[0];
        if (firstSong) {
          usePlayerStore.getState().setCurrentSong(firstSong);
        }
      },
    }),
    {
      name: 'ruaj-queue-storage',
      partialize: (state) => ({
        queue: state.queue,
        originalQueue: state.originalQueue,
        currentIndex: state.currentIndex,
        isShuffled: state.isShuffled,
        repeatMode: state.repeatMode,
      }),
    }
  )
);
