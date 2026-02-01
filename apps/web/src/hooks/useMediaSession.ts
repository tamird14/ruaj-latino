import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';

export const useMediaSession = () => {
  const { currentSong, isPlaying, currentTime, duration, play, pause, seek } = usePlayerStore();
  const { next, previous } = useQueueStore();

  // Update metadata when song changes
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title || currentSong.name,
        artist: currentSong.artist || 'Unknown Artist',
        album: currentSong.album || 'Unknown Album',
        artwork: currentSong.thumbnailUrl
          ? [
              { src: currentSong.thumbnailUrl, sizes: '96x96', type: 'image/png' },
              { src: currentSong.thumbnailUrl, sizes: '128x128', type: 'image/png' },
              { src: currentSong.thumbnailUrl, sizes: '192x192', type: 'image/png' },
              { src: currentSong.thumbnailUrl, sizes: '256x256', type: 'image/png' },
              { src: currentSong.thumbnailUrl, sizes: '384x384', type: 'image/png' },
              { src: currentSong.thumbnailUrl, sizes: '512x512', type: 'image/png' },
            ]
          : [],
      });
    }
  }, [currentSong]);

  // Update playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Update position state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentSong || !duration) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1,
        position: Math.min(currentTime, duration),
      });
    } catch {
      // Position state may not be supported
    }
  }, [currentTime, duration, currentSong]);

  // Set action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => play()],
      ['pause', () => pause()],
      ['previoustrack', () => previous()],
      ['nexttrack', () => next()],
      ['seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        seek(Math.max(0, currentTime - skipTime));
      }],
      ['seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        seek(Math.min(duration, currentTime + skipTime));
      }],
      ['seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      }],
      ['stop', () => {
        pause();
        seek(0);
      }],
    ];

    handlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Action may not be supported
      }
    });

    return () => {
      handlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Cleanup may fail
        }
      });
    };
  }, [play, pause, next, previous, seek, currentTime, duration]);
};
