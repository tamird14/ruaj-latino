import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';

export const useKeyboardShortcuts = () => {
  const { togglePlay, toggleMute, setVolume, volume, seek, currentTime, duration } = usePlayerStore();
  const { next, previous } = useQueueStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            next();
          } else {
            seek(Math.min(duration, currentTime + 5));
          }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) {
            previous();
          } else {
            seek(Math.max(0, currentTime - 5));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, setVolume, volume, seek, currentTime, duration, next, previous]);
};
