import { NavLink } from 'react-router-dom';
import { Home, FolderOpen, ListMusic, ListOrdered, Plus, Music2 } from 'lucide-react';
import { useUIStore } from '../../store';
import { SearchBar } from '../browser/SearchBar';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/browse', icon: FolderOpen, label: 'Browse' },
  { to: '/playlists', icon: ListMusic, label: 'Playlists' },
  { to: '/queue', icon: ListOrdered, label: 'Queue' },
];

export const Sidebar = () => {
  const { openCreatePlaylistModal } = useUIStore();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-dark-900/90 backdrop-blur-lg border-r border-dark-800/80">
      {/* Logo */}
      <div className="p-6 pb-5 border-b border-dark-800/60">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">Ruaj Latino</span>
        </NavLink>
      </div>

      {/* Search */}
      <div className="px-4 mt-4 mb-4">
        <SearchBar />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-200 border border-primary-500/25'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary-400 transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Create Playlist Button */}
        <div className="mt-6 px-1">
          <button
            onClick={openCreatePlaylistModal}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-dark-600 text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Playlist</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 text-xs text-gray-500 text-center border-t border-dark-800/60">
        Press <kbd className="px-1.5 py-0.5 bg-dark-800 rounded">Space</kbd> to play/pause
      </div>
    </aside>
  );
};
