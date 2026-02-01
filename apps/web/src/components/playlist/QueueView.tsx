import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Play, Pause, X } from 'lucide-react';
import { usePlayerStore, useQueueStore } from '../../store';
import type { Song } from '@ruaj-latino/shared';
import { formatDuration } from '../../utils/formatters';

interface SortableSongProps {
  song: Song;
  index: number;
  isCurrentSong: boolean;
  isPlaying: boolean;
  canReorder: boolean;
  onPlay: () => void;
  onRemove: () => void;
}

const SortableSong = ({
  song,
  index,
  isCurrentSong,
  isPlaying,
  canReorder,
  onPlay,
  onRemove,
}: SortableSongProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id, disabled: !canReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-colors ${
        isCurrentSong
          ? 'bg-primary-500/10 border border-primary-500/20'
          : 'hover:bg-dark-800'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className={`touch-none ${
          canReorder
            ? 'text-gray-500 hover:text-gray-300 cursor-grab'
            : 'text-gray-700 cursor-not-allowed'
        }`}
        disabled={!canReorder}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Index / Play indicator */}
      <div className="w-8 text-center">
        {isCurrentSong ? (
          isPlaying ? (
            <div className="flex items-center justify-center gap-0.5">
              <span className="w-1 h-3 bg-primary-500 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-primary-500 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-primary-500 rounded-full animate-pulse delay-150" />
            </div>
          ) : (
            <Pause className="w-4 h-4 text-primary-400 mx-auto" />
          )
        ) : (
          <span className="text-sm text-gray-500">{index + 1}</span>
        )}
      </div>

      {/* Song info */}
      <button
        onClick={onPlay}
        className="flex-1 min-w-0 text-left group/play"
      >
        <p
          className={`font-medium truncate ${
            isCurrentSong ? 'text-primary-400' : 'text-white group-hover/play:text-primary-400'
          } transition-colors`}
        >
          {song.title || song.name}
        </p>
        <p className="text-sm text-gray-400 truncate">
          {song.artist || 'Unknown Artist'}
        </p>
      </button>

      {/* Duration */}
      <span className="text-sm text-gray-500 tabular-nums">
        {formatDuration(song.duration || 0)}
      </span>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
          canReorder
            ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
            : 'text-gray-600 cursor-not-allowed'
        }`}
        disabled={!canReorder}
        title={canReorder ? 'Remove from queue' : 'Cannot remove while playing'}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const QueueView = () => {
  const { currentSong, isPlaying } = usePlayerStore();
  const { queue, currentIndex, reorderQueue, removeFromQueue, goToIndex } = useQueueStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const songIds = useMemo(() => queue.map((s) => s.id), [queue]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = songIds.indexOf(active.id as string);
      const newIndex = songIds.indexOf(over.id as string);
      reorderQueue(oldIndex, newIndex);
    }
  };

  if (queue.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Your queue is empty</p>
        <p className="text-sm text-gray-500 mt-1">
          Browse music and add songs to your queue
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={songIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {queue.map((song, index) => {
            const isCurrentSong = index === currentIndex;
            // Can only reorder if not playing OR not the current song
            const canReorder = !isPlaying || !isCurrentSong;

            return (
              <SortableSong
                key={song.id}
                song={song}
                index={index}
                isCurrentSong={isCurrentSong}
                isPlaying={isPlaying && isCurrentSong}
                canReorder={canReorder}
                onPlay={() => goToIndex(index)}
                onRemove={() => removeFromQueue(index)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};
