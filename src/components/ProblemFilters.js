import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProblemFilters({ onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    difficulty: [],
    status: [],
    topics: [],
  });

  const filters = {
    difficulty: [
      { id: 'easy', label: 'Easy', color: 'text-green-400' },
      { id: 'medium', label: 'Medium', color: 'text-yellow-400' },
      { id: 'hard', label: 'Hard', color: 'text-red-400' },
    ],
    status: [
      { id: 'solved', label: 'Solved', icon: '✅' },
      { id: 'unsolved', label: 'Unsolved', icon: '❌' },
      { id: 'attempted', label: 'Attempted', icon: '⏳' },
    ],
    topics: [
      { id: 'array', label: 'Array', icon: '📊' },
      { id: 'dp', label: 'DP', icon: '📈' },
      { id: 'graph', label: 'Graph', icon: '🔗' },
      { id: 'linkedlist', label: 'Linked List', icon: '⛓️' },
      { id: 'stack', label: 'Stack', icon: '📚' },
      { id: 'tree', label: 'Tree', icon: '🌳' },
      { id: 'greedy', label: 'Greedy', icon: '🎯' },
      { id: 'sorting', label: 'Sorting', icon: '🔀' },
    ],
  };

  const handleToggleFilter = (category, id) => {
    const newFilters = { ...selectedFilters };
    if (newFilters[category].includes(id)) {
      newFilters[category] = newFilters[category].filter(f => f !== id);
    } else {
      newFilters[category].push(id);
    }
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    const emptyFilters = { difficulty: [], status: [], topics: [] };
    setSelectedFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const totalFilters = Object.values(selectedFilters).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-gray-900 dark:text-white font-semibold"
        >
          <span>Filters {totalFilters > 0 && `(${totalFilters})`}</span>
          <ChevronDown
            size={20}
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Filter Content */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="max-h-96 overflow-y-auto"
        >
          {Object.entries(filters).map(([category, options]) => (
            <div key={category} className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize text-sm">
                {category}
              </h4>
              <div className="space-y-2">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters[category].includes(option.id)}
                      onChange={() => handleToggleFilter(category, option.id)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <span className={`text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white ${option.color || ''}`}>
                      {option.icon && <span className="mr-1">{option.icon}</span>}
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Clear All Button */}
          {totalFilters > 0 && (
            <div className="p-4">
              <button
                onClick={handleClearAll}
                className="w-full py-2 px-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
