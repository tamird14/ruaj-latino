import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AudioPlayer } from '../player/AudioPlayer';
import { Toast } from '../common/Toast';
import { PasswordModal } from '../playlist/PasswordModal';
import { CreatePlaylistModal } from '../playlist/CreatePlaylistModal';
import { AddToPlaylistModal } from '../playlist/AddToPlaylistModal';
import { SaveQueueAsPlaylistModal } from '../playlist/SaveQueueAsPlaylistModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const Layout = () => {
  useKeyboardShortcuts();

  return (
    <div className="h-full flex flex-col bg-dark-950">
      {/* Header - mobile only */}
      <Header />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - desktop only */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-[calc(152px+env(safe-area-inset-bottom))] md:pb-24">
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6 safe-left safe-right overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile navigation */}
      <MobileNav />

      {/* Player bar - fixed at bottom */}
      <AudioPlayer />

      {/* Modals */}
      <PasswordModal />
      <CreatePlaylistModal />
      <AddToPlaylistModal />
      <SaveQueueAsPlaylistModal />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};
