import { Link } from 'react-router-dom';
import { Music2 } from 'lucide-react';
import { SearchBar } from '../browser/SearchBar';

export const Header = () => {
  return (
    <header className="md:hidden bg-dark-900 border-b border-dark-800 px-4 py-3 safe-top">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient">Ruaj Latino</span>
        </Link>

        {/* Search - expands on mobile */}
        <div className="flex-1">
          <SearchBar compact />
        </div>
      </div>
    </header>
  );
};
