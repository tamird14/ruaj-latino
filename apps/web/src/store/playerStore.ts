import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song } from '@ruaj-latino/shared';

interface PlayerState {
  // Current playback state
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Audio element reference (not persisted)
  audioRef: HTMLAudioElement | null;

  // Actions
  setAudioRef: (ref: HTMLAudioElement | null) => void;
  setCurrentSong: (song: Song | null) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  restart: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      audioRef: null,

      setAudioRef: (ref) => set({ audioRef: ref }),

      setCurrentSong: (song) => set({ currentSong: song, currentTime: 0, duration: 0 }),

      play: () => {
        const { audioRef } = get();
        if (audioRef) {
          audioRef.play().catch(console.error);
        }
        set({ isPlaying: true });
      },

      pause: () => {
        const { audioRef } = get();
        if (audioRef) {
          audioRef.pause();
        }
        set({ isPlaying: false });
      },

      togglePlay: () => {
        const { isPlaying, play, pause } = get();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      },

      stop: () => {
        const { audioRef } = get();
        if (audioRef) {
          audioRef.pause();
          audioRef.currentTime = 0;
        }
        set({ isPlaying: false, currentTime: 0 });
      },

      restart: () => {
        const { audioRef, play } = get();
        if (audioRef) {
          audioRef.currentTime = 0;
        }
        set({ currentTime: 0 });
        play();
      },

      seek: (time) => {
        const { audioRef } = get();
        if (audioRef) {
          audioRef.currentTime = time;
        }
        set({ currentTime: time });
      },

      setVolume: (volume) => {
        const { audioRef } = get();
        const clampedVolume = Math.max(0, Math.min(1, volume));
        if (audioRef) {
          audioRef.volume = clampedVolume;
        }
        set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
      },

      toggleMute: () => {
        const { audioRef, isMuted } = get();
        if (audioRef) {
          audioRef.muted = !isMuted;
        }
        set({ isMuted: !isMuted });
      },

      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
    }),
    {
      name: 'ruaj-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
      }),
    }
  )
);
