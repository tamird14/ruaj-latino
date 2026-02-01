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
    <aside className="hidden md:flex w-64 flex-col bg-dark-900 border-r border-dark-800">
      {/* Logo */}
      <div className="p-6">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">Ruaj Latino</span>
        </NavLink>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
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
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
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
      <div className="p-4 text-xs text-gray-500 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-dark-800 rounded">Space</kbd> to play/pause
      </div>
    </aside>
  );
};
