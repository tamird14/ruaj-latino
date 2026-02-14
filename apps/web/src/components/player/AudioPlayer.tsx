import { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { usePlayerStore, useQueueStore, useUIStore } from '../../store';
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
  } = usePlayerStore();
  const { next } = useQueueStore();
  const { isPlayerExpanded, togglePlayerExpanded } = useUIStore();

  // Set audio ref in store - must re-run when currentSong changes
  // because the audio element is only rendered when there's a currentSong
  useEffect(() => {
    if (currentSong && audioRef.current) {
      setAudioRef(audioRef.current);
    }
    return () => setAudioRef(null);
  }, [setAudioRef, currentSong]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => next();
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      // Auto-play when new song loads and isPlaying is true
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };
    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [next, setCurrentTime, setDuration, isPlaying]);

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
      <div
        className={`fixed left-0 right-0 bg-dark-900/95 backdrop-blur-lg md:bg-dark-900 md:backdrop-blur-none md:shadow-[0_-14px_30px_rgba(0,0,0,0.45)] border-t border-dark-800 z-50 transition-all duration-300 ${
          isPlayerExpanded
            ? 'bottom-0 h-screen md:h-auto md:bottom-0'
            : 'bottom-[calc(72px+env(safe-area-inset-bottom))] md:bottom-0'
        }`}
      >
        {/* Expand/collapse button - mobile only */}
        <button
          onClick={togglePlayerExpanded}
          className="md:hidden absolute -top-11 left-1/2 -translate-x-1/2 w-11 h-11 bg-dark-800 rounded-full flex items-center justify-center text-gray-400"
        >
          {isPlayerExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </button>

        {/* Expanded mobile view */}
        {isPlayerExpanded && (
          <div className="md:hidden h-full flex flex-col p-6 safe-top safe-bottom">
            {/* Album art placeholder */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-64 h-64 bg-dark-800 rounded-2xl flex items-center justify-center">
                {currentSong.thumbnailUrl ? (
                  <img
                    src={currentSong.thumbnailUrl}
                    alt={currentSong.title || currentSong.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="text-6xl text-gray-600">🎵</div>
                )}
              </div>
            </div>

            {/* Song info */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white truncate">
                {currentSong.title || currentSong.name}
              </h2>
              <p className="text-gray-400 truncate">
                {currentSong.artist || 'Unknown Artist'}
              </p>
            </div>

            {/* Progress */}
            <ProgressBar className="mb-6" />

            {/* Controls */}
            <PlayerControls size="large" />

            {/* Volume */}
            <div className="mt-6">
              <VolumeControl />
            </div>
          </div>
        )}

        {/* Compact view (desktop and collapsed mobile) */}
        <div className={`${isPlayerExpanded ? 'hidden md:flex' : 'flex'} items-center gap-2 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 md:safe-bottom`}>
          {/* Now Playing - left section */}
          <NowPlaying />

          {/* Controls and Progress - center section */}
          <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl">
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
