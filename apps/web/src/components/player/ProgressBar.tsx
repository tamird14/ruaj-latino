import type { SyntheticEvent } from 'react';
import { usePlayerStore } from '../../store';
import { formatTime } from '../../utils/formatters';

interface ProgressBarProps {
  className?: string;
}

export const ProgressBar = ({ className = '' }: ProgressBarProps) => {
  const { currentTime, duration } = usePlayerStore();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const blockProgressInteraction = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current time */}
      <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
        {formatTime(currentTime)}
      </span>

      {/* Progress bar (display only) */}
      <div
        className="flex-1 h-1 bg-dark-700 rounded-full relative cursor-default select-none"
        onClick={blockProgressInteraction}
        onMouseDown={blockProgressInteraction}
        onTouchStart={blockProgressInteraction}
      >
        {/* Filled progress */}
        <div
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Duration */}
      <span className="text-xs text-gray-400 w-10 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
};
