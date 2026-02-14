import { NavLink } from 'react-router-dom';
import { Home, FolderOpen, ListMusic, ListOrdered } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/browse', icon: FolderOpen, label: 'Browse' },
  { to: '/playlists', icon: ListMusic, label: 'Playlists' },
  { to: '/queue', icon: ListOrdered, label: 'Queue' },
];

export const MobileNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-lg border-t border-dark-800 z-40 pb-[max(env(safe-area-inset-bottom),8px)]">
      <div className="grid grid-cols-4 items-center h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                isActive ? 'text-primary-400' : 'text-gray-500'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
