import { useRef, useEffect } from 'react';
import { usePlayerStore, useQueueStore } from '../../store';
import { getStreamUrl } from '../../services/api';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { NowPlaying } from './NowPlaying';

export const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    setAudioRef,
    setCurrentTime,
    setDuration,
    play,
    pause,
  } = usePlayerStore();
  const { next } = useQueueStore();

  // Track isPlaying via ref so event handlers always have latest value without re-mounting
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Track last loaded song to detect new song vs re-buffer
  const lastLoadedSongIdRef = useRef<string | null>(null);

  // Set audio ref in store - must re-run when currentSong changes
  // because the audio element is only rendered when there's a currentSong
  useEffect(() => {
    if (currentSong && audioRef.current) {
      setAudioRef(audioRef.current);
    }
    return () => setAudioRef(null);
  }, [setAudioRef, currentSong]);

  // Handle audio events - stable handlers that don't re-mount on isPlaying changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => next();
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      // Only auto-play if this is a NEW song, not a re-buffer of the same song
      const currentId = usePlayerStore.getState().currentSong?.id;
      if (currentId && currentId !== lastLoadedSongIdRef.current) {
        lastLoadedSongIdRef.current = currentId;
        if (isPlayingRef.current) {
          audio.play().catch(console.error);
        }
      }
    };
    // Sync browser/OS-initiated pause (e.g. iOS audio interruption) back to Zustand
    const handlePause = () => {
      if (isPlayingRef.current) {
        pause();
      }
    };
    // Sync browser/OS-initiated play back to Zustand
    const handlePlay = () => {
      if (!isPlayingRef.current) {
        play();
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [next, setCurrentTime, setDuration, play, pause]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Handle play state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  const streamUrl = currentSong ? getStreamUrl(currentSong.driveFileId) : '';

  if (!currentSong) {
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={streamUrl}
        preload="metadata"
      />

      {/* Player UI */}
      <div className="fixed left-0 right-0 bottom-[calc(62px+max(env(safe-area-inset-bottom),4px))] md:bottom-0 bg-dark-900/95 backdrop-blur-lg md:bg-dark-900 md:backdrop-blur-none md:shadow-[0_-14px_30px_rgba(0,0,0,0.45)] border-t border-dark-800 z-50">
        {/* Compact view */}
        <div className="flex items-center gap-2 md:gap-4 px-4 md:px-4 py-2 md:py-3 md:safe-bottom">
          {/* Now Playing - left section */}
          <NowPlaying />

          {/* Controls and Progress - center section */}
          <div className="flex-1 flex flex-col items-center gap-1 md:gap-2 max-w-2xl">
            <PlayerControls />
            <ProgressBar className="w-full hidden md:flex" />
          </div>

          {/* Volume - right section (desktop only) */}
          <div className="hidden md:block w-36">
            <VolumeControl />
          </div>
        </div>
      </div>
    </>
  );
};
