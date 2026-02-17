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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-lg border-t border-dark-800 z-40 pb-[max(env(safe-area-inset-bottom),4px)]">
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1.5 rounded-lg transition-colors touch-manipulation ${
                isActive
                  ? 'text-primary-400'
                  : 'text-gray-500 active:text-gray-300'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
