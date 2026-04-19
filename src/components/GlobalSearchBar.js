import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const normalizeId = (item) => item?._id || item?.id || null;

  const buildProblemItems = (problems = []) =>
    problems
      .map((problem) => ({
        id: normalizeId(problem),
        title: problem?.title || 'Untitled Problem',
        subtitle: problem?.difficulty || problem?.category || 'problem',
        category: 'problem',
      }))
      .filter((item) => item.id);

  const buildContestItems = (contests = []) =>
    contests
      .map((contest) => ({
        id: normalizeId(contest),
        title: contest?.title || 'Untitled Contest',
        subtitle: contest?.difficulty || contest?.status || 'contest',
        category: 'contest',
      }))
      .filter((item) => item.id);

  const buildUserItems = (users = []) =>
    users
      .map((user) => {
        const id = normalizeId(user?.userId || user);
        const username =
          user?.username ||
          user?.name ||
          user?.fullName ||
          user?.userId?.username ||
          [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

        return {
          id,
          title: username || 'Unknown User',
          subtitle: user?.rating ? `Rating ${user.rating}` : 'user',
          category: 'user',
        };
      })
      .filter((item) => item.id && item.title);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const [problemsRes, contestsRes, leaderboardRes] = await Promise.allSettled([
          fetch(`${API_BASE}/problems?limit=1000`, { headers }),
          fetch(`${API_BASE}/contests?limit=1000`, { headers }),
          fetch(`${API_BASE}/leaderboard`, { headers }),
        ]);

        let problems = [];
        let contests = [];
        let users = [];

        if (problemsRes.status === 'fulfilled' && problemsRes.value.ok) {
          const data = await problemsRes.value.json();
          problems = data?.problems || data || [];
        }

        if (contestsRes.status === 'fulfilled' && contestsRes.value.ok) {
          const data = await contestsRes.value.json();
          contests = data?.contests || data || [];
        }

        if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.ok) {
          const data = await leaderboardRes.value.json();
          users =
            data?.leaderboard ||
            data?.users ||
            data?.rankings ||
            [];
        }

        setAllItems([
          ...buildProblemItems(problems),
          ...buildContestItems(contests),
          ...buildUserItems(users),
        ]);
      } catch (error) {
        setAllItems([]);
      }
    };

    fetchSearchData();
  }, []);

  const filteredResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) return [];

    return allItems
      .filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(trimmed);
        const subtitleMatch = item.subtitle?.toLowerCase().includes(trimmed);
        const categoryMatch = item.category?.toLowerCase().includes(trimmed);
        return titleMatch || subtitleMatch || categoryMatch;
      })
      .slice(0, 8);
  }, [query, allItems]);

  useEffect(() => {
    if (query.length > 0) {
      setResults(filteredResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, filteredResults]);

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
    } else if (item.category === 'contest') {
      navigate(`/contest/${item.id}`);
    } else if (item.category === 'user') {
      navigate(`/profile/${item.id}`);
    }

    setQuery('');
    setIsOpen(false);
  };

  const getEmoji = (category) => {
    if (category === 'problem') return '📝';
    if (category === 'contest') return '🏆';
    if (category === 'user') return '👤';
    return '🔎';
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search problems, contests, users..."
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

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto">
            {results.map((item, idx) => (
              <button
                key={`${item.category}-${item.id}-${idx}`}
                onClick={() => handleSelectResult(item)}
                className="w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3"
              >
                <span className="text-xl">{getEmoji(item.category)}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {item.category}
                    {item.subtitle ? ` • ${item.subtitle}` : ''}
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