import { useState, useRef } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../store';

export const VolumeControl = () => {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const displayVolume = isMuted ? 0 : volume;

  const VolumeIcon = displayVolume === 0 ? VolumeX : displayVolume < 0.5 ? Volume1 : Volume2;

  const calculateVolume = (clientX: number): number => {
    if (!sliderRef.current) return volume;

    const rect = sliderRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const newVolume = calculateVolume(e.clientX);
    setVolume(newVolume);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newVolume = calculateVolume(e.clientX);
      setVolume(newVolume);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="btn-icon text-gray-400 hover:text-gray-200"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className="w-5 h-5" />
      </button>

      {/* Volume slider */}
      <div
        ref={sliderRef}
        className="w-24 h-1 bg-dark-700 rounded-full cursor-pointer relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Filled volume */}
        <div
          className="h-full bg-gray-400 group-hover:bg-primary-500 rounded-full relative transition-colors"
          style={{ width: `${displayVolume * 100}%` }}
        >
          {/* Thumb */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
        </div>
      </div>
    </div>
  );
};
