import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  RotateCcw,
  Square,
} from 'lucide-react';
import { usePlayerStore, useQueueStore } from '../../store';

interface PlayerControlsProps {
  size?: 'small' | 'medium' | 'large';
}

export const PlayerControls = ({ size = 'medium' }: PlayerControlsProps) => {
  const { isPlaying, togglePlay, restart, stop } = usePlayerStore();
  const { next, previous, isShuffled, repeatMode, toggleShuffle, cycleRepeat, resetPlaylist } = useQueueStore();

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  const playButtonSizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-14 h-14',
  };

  const playIconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-7 h-7',
  };

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={`btn-icon hidden md:flex ${
          isShuffled ? 'text-primary-400' : 'text-gray-400 hover:text-gray-200'
        }`}
        title="Shuffle"
      >
        <Shuffle className={iconSizes[size]} />
      </button>

      {/* Previous */}
      <button
        onClick={previous}
        className="btn-icon text-gray-400 hover:text-gray-200"
        title="Previous (or restart if >3s)"
      >
        <SkipBack className={iconSizes[size]} />
      </button>

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className={`${playButtonSizes[size]} rounded-full bg-white text-dark-950 hover:scale-105 transition-transform flex items-center justify-center`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className={playIconSizes[size]} fill="currentColor" />
        ) : (
          <Play className={playIconSizes[size]} fill="currentColor" />
        )}
      </button>

      {/* Next */}
      <button
        onClick={next}
        className="btn-icon text-gray-400 hover:text-gray-200"
        title="Next"
      >
        <SkipForward className={iconSizes[size]} />
      </button>

      {/* Repeat */}
      <button
        onClick={cycleRepeat}
        className={`btn-icon hidden md:flex ${
          repeatMode !== 'none' ? 'text-primary-400' : 'text-gray-400 hover:text-gray-200'
        }`}
        title={`Repeat: ${repeatMode}`}
      >
        <RepeatIcon className={iconSizes[size]} />
      </button>

      {/* Stop */}
      <button
        onClick={stop}
        className="btn-icon text-gray-400 hover:text-gray-200"
        title="Stop"
      >
        <Square className={iconSizes[size]} fill="currentColor" />
      </button>

      {/* Restart song */}
      <button
        onClick={restart}
        className="btn-icon hidden md:flex text-gray-400 hover:text-gray-200"
        title="Restart song"
      >
        <RotateCcw className={iconSizes[size]} />
      </button>

      {/* Reset playlist */}
      <button
        onClick={resetPlaylist}
        className="btn-icon hidden lg:flex text-gray-400 hover:text-gray-200"
        title="Reset playlist (start from beginning)"
      >
        <span className="text-xs font-bold">1</span>
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );
};
