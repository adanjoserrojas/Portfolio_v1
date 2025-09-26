// components/SearchBar.tsx
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
      setQuery('');
    }
  };

  return (
    
    <form onSubmit={handleSubmit} className="relative w-screen max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-darkBeige w-5 h-5"/>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chat with me :3"
          className="w-full pl-10 pr-4 py-3 border-1 border-Black-100 rounded-full focus:border-Laguna focus:outline-none transition-colors text-Beige"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-Laguna text-Beige px-4 py-1 rounded-3xl hover:bg-Blue disabled:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Thinking...' : 'Ask'}
        </button>
      </div>
    </form>
  );
}