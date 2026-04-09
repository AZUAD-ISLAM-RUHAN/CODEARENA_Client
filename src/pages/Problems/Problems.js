import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProblemFilters from '../../components/ProblemFilters';
import ThemeToggle from '../../components/ThemeToggle';
import GlobalSearchBar from '../../components/GlobalSearchBar';
import { useTheme } from '../../context/ThemeContext';

function Problems() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [sortBy, setSortBy] = useState('title'); // 'title', 'difficulty', 'submissions'
  const [filters, setFilters] = useState({
    difficulty: [],
    status: [],
    topics: [],
  });
  const [user] = useState(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) return JSON.parse(currentUser);
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) return JSON.parse(userProfile);
      return { username: 'User', photoUrl: null, solvedProblems: [], _id: null };
    } catch (error) {
      console.error('Error parsing user data:', error);
      return { username: 'User', photoUrl: null, solvedProblems: [], _id: null };
    }
  });

  // Fetch problems from API
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        console.log('Fetching problems...');
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`http://localhost:5001/api/problems?limit=25&page=${currentPage}`, {
          headers: headers
        });
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.problems) {
          console.log('Problems found:', data.problems.length);
          // Fetch user submission status
          let submissionStatus = {};
          if (token) {
            try {
              const statusResponse = await fetch('http://localhost:5001/api/submissions/user/status', headers);
              const statusData = await statusResponse.json();
              submissionStatus = statusData.problemStatus || {};
            } catch (error) {
              console.error('Error fetching submission status:', error);
            }
          }

          // Map problems to match user's solved status
          const solvedProblemIds = user.solvedProblems ? user.solvedProblems.map(p => (typeof p === 'object' ? p._id || p.id : p)) : [];
          const formattedProblems = data.problems.map(problem => {
            const problemId = problem._id;
            const isSolved = solvedProblemIds.includes(problemId);
            const hasAttempted = submissionStatus[problemId];
            const status = hasAttempted ? hasAttempted.status : null;

            return {
              id: problem._id,
              title: problem.title,
              difficulty: problem.difficulty,
              topic: problem.category,
              solved: isSolved,
              attempted: !!hasAttempted,
              status: status,
              xp: problem.difficulty === 'Easy' ? 50 : problem.difficulty === 'Medium' ? 100 : 200,
              submissions: problem.totalSubmissions || 0,
              accepted: problem.acceptedSubmissions || 0,
              description: problem.description
            };
          });
          setProblems(formattedProblems);
          // Store total pages for pagination
          if (data.totalPages) {
            setTotalPages(data.totalPages);
          }
        } else {
          console.log('No problems in response');
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [user.solvedProblems, user._id, currentPage]);

  const difficultyColor = {
    Easy: 'text-green-400 bg-green-400/10',
    Medium: 'text-yellow-400 bg-yellow-400/10',
    Hard: 'text-red-400 bg-red-400/10',
  };

  // Apply filters and sorting
  const displayProblems = problems.length > 0 ? problems : [];
  const filtered = displayProblems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = filters.difficulty.length === 0 || filters.difficulty.includes(p.difficulty.toLowerCase());
    const matchTopic = filters.topics.length === 0 || filters.topics.includes(p.topic.toLowerCase().replace(/\s+/g, ''));
    const matchStatus = filters.status.length === 0 || 
      (filters.status.includes('solved') && p.solved) ||
      (filters.status.includes('unsolved') && !p.solved);
    
    return matchSearch && matchDifficulty && matchTopic && matchStatus;
  });

  // Sort problems
  const sortedProblems = [...filtered].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'difficulty':
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        aValue = difficultyOrder[a.difficulty] || 0;
        bValue = difficultyOrder[b.difficulty] || 0;
        break;
      case 'submissions':
        aValue = a.submissions || 0;
        bValue = b.submissions || 0;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`border-b transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/dashboard')}>
            Code<span className="text-yellow-400">Arena</span>
          </h1>

          {/* Center: Search Bar */}
          <div className="flex-1 px-8">
            <GlobalSearchBar />
          </div>

          {/* Right: Nav Items */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className={`transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Dashboard</button>
              <button onClick={() => navigate('/battle')} className={`transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Battle</button>
              <button onClick={() => navigate('/contest')} className={`transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Contests</button>
              <button onClick={() => navigate('/leaderboard')} className={`transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Leaderboard</button>
            </div>

            <ThemeToggle />
            
            <div className="relative group">
              {user.photoUrl ? (
              <img 
                src={user.photoUrl} 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover cursor-pointer"
                onClick={() => navigate('/profile')}
              />
            ) : (
              <button 
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full bg-yellow-400 text-gray-950 font-bold flex items-center justify-center cursor-pointer"
              >
                {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </button>
            )}
              <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <div className="py-2">
                  <button 
                    onClick={() => navigate('/profile')}
                    className={`w-full text-left px-4 py-2 transition ${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    👤 Profile
                  </button>
                  <button 
                    onClick={() => navigate('/profile')}
                    className={`w-full text-left px-4 py-2 transition ${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    ⚙️ Settings
                  </button>
                  <hr className={isDark ? 'border-gray-800' : 'border-gray-200'} />
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-3xl font-bold">Problem <span className="text-yellow-400">Bank</span></h2>
          <p className={`mt-1 transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Solve problems, earn XP, level up!</p>
        </motion.div>
        
        {/* Stats */}
        <motion.div variants={containerVariants} className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Solved', value: problems.filter(p => p.solved).length, color: 'text-green-400' },
            { label: 'Unsolved', value: problems.filter(p => !p.solved && !p.attempted).length, color: 'text-yellow-400' },
            { label: 'Attempt', value: problems.filter(p => p.attempted).length, color: 'text-purple-400' },
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className={`rounded-xl p-4 text-center border transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
            >
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className={`text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <motion.div variants={itemVariants}>
            <ProblemFilters onFilterChange={setFilters} />
          </motion.div>

          {/* Problems Table */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            {/* Search and Sort Controls */}
            <div className={`rounded-xl p-4 mb-6 border transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder="🔍 Search problems..."
                    className={`w-full rounded-lg px-4 py-2 border transition ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-gray-100 text-gray-900 border-gray-300 focus:border-yellow-400'} focus:outline-none`}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`rounded-lg px-3 py-2 border transition ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:border-yellow-400`}
                  >
                    <option value="title">Sort by Title</option>
                    <option value="difficulty">Sort by Difficulty</option>
                    <option value="submissions">Sort by Submissions</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className={`rounded-lg px-3 py-2 border transition ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:border-yellow-400`}
                  >
                    <option value="asc">Ascending ↑</option>
                    <option value="desc">Descending ↓</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Problems Table */}
            <div className={`rounded-xl overflow-hidden border transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <table className="w-full">
                <thead>
                  <tr className={`border-b transition ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Title</th>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Topic</th>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Difficulty</th>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>XP</th>
                    <th className={`text-left px-6 py-4 text-sm font-semibold transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProblems.map((problem, idx) => (
                    <motion.tr
                      key={problem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => navigate(`/problem/${problem.id}`)}
                      whileHover={{ scale: 1.01 }}
                      className={`border-b cursor-pointer transition ${isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-100/50'} last:border-0`}
                    >
                      <td className="px-6 py-4">
                        {problem.solved ? (
                          <span className="text-green-400 text-lg">✅</span>
                        ) : problem.attempted ? (
                          <span className="text-yellow-400 text-lg animate-spin">⏳</span>
                        ) : (
                          <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>⭕</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 font-medium transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{problem.title}</td>
                      <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full transition ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{problem.topic}</span></td>
                      <td className="px-6 py-4"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColor[problem.difficulty]}`}>{problem.difficulty}</span></td>
                      <td className="px-6 py-4 text-yellow-400 font-medium">+{problem.xp} XP</td>
                      <td className={`px-6 py-4 transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{problem.submissions.toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {sortedProblems.length === 0 && (
                <div className={`text-center py-12 transition ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No problems found. Try a different filter!
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={`rounded-xl p-4 border transition flex items-center justify-between ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : `${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`} ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  ← Previous
                </button>
                <div className={`flex items-center gap-2 transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Page</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value) || 1;
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    className={`w-12 px-2 py-1 rounded text-center transition ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} border`}
                  />
                  <span>of {totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg transition ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : `${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`} ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  Next →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Problems;