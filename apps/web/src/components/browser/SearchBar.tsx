import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  compact?: boolean;
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ compact = false, onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(!compact);
  const inputRef = useRef<HTMLInputElement>(null);
  const onSearchRef = useRef(onSearch);
  const navigate = useNavigate();

  // Keep ref in sync without resetting debounce
  onSearchRef.current = onSearch;

  // Debounce search - use ref so parent re-renders don't reset the timer
  useEffect(() => {
    if (!onSearchRef.current) return;

    const timer = setTimeout(() => {
      onSearchRef.current?.(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/browse?search=${encodeURIComponent(query.trim())}`);
      if (compact) {
        setIsExpanded(false);
      }
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  if (compact && !isExpanded) {
    return (
      <button
        onClick={handleExpand}
        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-dark-800 rounded-lg transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => compact && !query && setIsExpanded(false)}
        placeholder="Search songs..."
        className="w-full pl-10 pr-8 py-2 bg-dark-800 border border-dark-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
};
