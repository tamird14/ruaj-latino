import { useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '../../store';
import { formatTime } from '../../utils/formatters';

interface ProgressBarProps {
  className?: string;
}

export const ProgressBar = ({ className = '' }: ProgressBarProps) => {
  const { currentTime, duration, seek } = usePlayerStore();
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const calculateTime = useCallback((clientX: number): number => {
    if (!progressRef.current || !duration) return 0;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return percent * duration;
  }, [duration]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const time = calculateTime(e.clientX);
    seek(time);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const time = calculateTime(e.clientX);
    setHoverTime(time);

    if (isDragging) {
      seek(time);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const time = calculateTime(e.touches[0].clientX);
    seek(time);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const time = calculateTime(e.touches[0].clientX);
      seek(time);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current time */}
      <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
        {formatTime(currentTime)}
      </span>

      {/* Progress bar */}
      <div
        ref={progressRef}
        className="flex-1 h-1 bg-dark-700 rounded-full cursor-pointer group relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Filled progress */}
        <div
          className="h-full bg-primary-500 rounded-full relative"
          style={{ width: `${progress}%` }}
        >
          {/* Thumb */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
        </div>

        {/* Hover preview */}
        {hoverTime !== null && (
          <div
            className="absolute -top-8 px-2 py-1 bg-dark-800 rounded text-xs text-white transform -translate-x-1/2 pointer-events-none"
            style={{ left: `${(hoverTime / duration) * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Duration */}
      <span className="text-xs text-gray-400 w-10 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
};
