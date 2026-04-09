import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Mock data for problems and users
  const problems = [
    { id: 1, title: 'Two Sum', category: 'problem' },
    { id: 2, title: 'Reverse Linked List', category: 'problem' },
    { id: 3, title: 'Binary Search', category: 'problem' },
    { id: 4, title: 'Longest Common Subsequence', category: 'problem' },
    { id: 5, title: 'Valid Parentheses', category: 'problem' },
  ];

  const users = [
    { id: 1, name: 'Alice Johnson', category: 'user' },
    { id: 2, name: 'Bob Smith', category: 'user' },
    { id: 3, name: 'Charlie Brown', category: 'user' },
  ];

  const allItems = [...problems, ...users];

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allItems.filter(item =>
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.name?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 8));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item) => {
    if (item.category === 'problem') {
      navigate(`/problem/${item.id}`);
    } else {
      navigate(`/profile/${item.id}`);
    }
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search problems, users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-400 transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto">
            {results.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectResult(item)}
                className="w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3"
              >
                <span className="text-xl">
                  {item.category === 'problem' ? '📝' : '👤'}
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.title || item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {item.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.length > 0 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
