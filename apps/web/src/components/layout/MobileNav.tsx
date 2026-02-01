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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-800 safe-bottom z-40">
      <div className="flex items-center justify-around py-2 pb-20">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
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
