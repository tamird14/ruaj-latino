import { Trash2, Shuffle, RotateCcw, ListMusic, ListPlus } from 'lucide-react';
import { useQueueStore, useUIStore } from '../store';
import { QueueView } from '../components/playlist/QueueView';

export const Queue = () => {
  const { queue, isShuffled, toggleShuffle, resetPlaylist, clearQueue } = useQueueStore();
  const { addToast, openSaveQueueModal } = useUIStore();

  const handleClear = () => {
    if (queue.length === 0) return;

    if (confirm('Are you sure you want to clear the queue?')) {
      clearQueue();
      addToast('Queue cleared', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Queue</h1>
          <p className="text-gray-400 text-sm mt-1">
            {queue.length} {queue.length === 1 ? 'song' : 'songs'}
          </p>
        </div>

        {queue.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={openSaveQueueModal}
              className="btn-primary"
              title="Save queue as playlist"
            >
              <ListPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Save as Playlist</span>
            </button>

            <button
              onClick={toggleShuffle}
              className={`btn-secondary ${isShuffled ? 'text-primary-400' : ''}`}
              title={isShuffled ? 'Unshuffle' : 'Shuffle'}
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isShuffled ? 'Unshuffle' : 'Shuffle'}
              </span>
            </button>

            <button
              onClick={resetPlaylist}
              className="btn-secondary"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleClear}
              className="btn-secondary text-red-400 hover:text-red-300"
              title="Clear queue"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Queue content */}
      {queue.length === 0 ? (
        <div className="card text-center py-12">
          <ListMusic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Your queue is empty</p>
          <p className="text-sm text-gray-500 mt-2">
            Browse music and add songs to start playing
          </p>
        </div>
      ) : (
        <div className="card">
          <QueueView />
        </div>
      )}

      {/* Tips */}
      {queue.length > 0 && (
        <div className="card bg-dark-900/50 text-sm text-gray-400">
          <p>
            <strong className="text-gray-300">Tip:</strong> Drag songs to reorder. You can't
            move the currently playing song while it's playing. Stop playback first to
            reorder all songs.
          </p>
        </div>
      )}
    </div>
  );
};
