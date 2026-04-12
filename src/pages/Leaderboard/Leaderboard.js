import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../components/NotificationDropdown';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Leaderboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalSolved: 0,
    totalBattlesWon: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const [currentUser] = useState(() => {
    try {
      const user = localStorage.getItem('currentUser');
      if (user) return JSON.parse(user);

      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) return JSON.parse(userProfile);

      return {
        firstName: 'User',
        username: 'user',
        experience: 0,
        solvedProblems: [],
        rating: 1200,
        streak: 0,
        level: 1
      };
    } catch (error) {
      return {
        firstName: 'User',
        username: 'user',
        experience: 0,
        solvedProblems: [],
        rating: 1200,
        streak: 0,
        level: 1
      };
    }
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`http://localhost:5001/api/leaderboard?sortBy=${sortBy}&limit=100`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch leaderboard');
        }

        setLeaderboardUsers(data.leaderboard || []);
        setSummary(
          data.summary || {
            totalUsers: 0,
            totalSolved: 0,
            totalBattlesWon: 0,
            averageRating: 0
          }
        );
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError(error.message || 'Failed to fetch leaderboard');
        setLeaderboardUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return leaderboardUsers;

    return leaderboardUsers.filter((user) => {
      const displayName = (user.displayName || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      return displayName.includes(query) || username.includes(query);
    });
  }, [leaderboardUsers, search]);

  const topThree = filteredUsers.slice(0, 3);
  const remainingUsers = filteredUsers.slice(3);

  const rankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getCardStyles = (index) => {
    if (index === 0) {
      return isDark
        ? 'bg-gradient-to-b from-yellow-400/10 to-gray-900 border-yellow-400/40 shadow-lg shadow-yellow-400/10'
        : 'bg-gradient-to-b from-yellow-100 to-white border-yellow-400/40 shadow-lg shadow-yellow-200';
    }

    if (index === 1) {
      return isDark
        ? 'bg-gray-900 border-gray-700'
        : 'bg-white border-gray-300';
    }

    return isDark
      ? 'bg-gray-900 border-gray-800'
      : 'bg-white border-gray-200';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <nav className={`border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
          Code<span className="text-yellow-400">Arena</span>
        </h1>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Dashboard
          </button>
          <button onClick={() => navigate('/problems')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Problems
          </button>
          <button onClick={() => navigate('/battle')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Battle
          </button>
          <button onClick={() => navigate('/contest')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Contests
          </button>

          <ThemeToggle />
          <NotificationDropdown />

          <div className="relative group">
            {currentUser.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover cursor-pointer"
                onClick={() => navigate('/profile')}
              />
            ) : (
              <button
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full bg-yellow-400 text-gray-950 font-bold flex items-center justify-center cursor-pointer"
              >
                {currentUser.firstName
                  ? currentUser.firstName.charAt(0).toUpperCase()
                  : currentUser.username
                  ? currentUser.username.charAt(0).toUpperCase()
                  : 'A'}
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
                <hr className={isDark ? 'border-gray-800 my-2' : 'border-gray-200 my-2'} />
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
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Professional <span className="text-yellow-400">Leaderboard</span>
          </h2>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Real rankings from registered CodeArena accounts only.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Registered Users', value: summary.totalUsers },
            { label: 'Total Solved', value: summary.totalSolved },
            { label: 'Battle Wins', value: summary.totalBattlesWon },
            { label: 'Average Rating', value: summary.averageRating }
          ].map((item, index) => (
            <div
              key={index}
              className={`rounded-2xl border p-5 transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
            >
              <div className="text-sm text-gray-400">{item.label}</div>
              <div className="text-2xl font-bold mt-2 text-yellow-400">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </div>
            </div>
          ))}
        </div>

        <div className={`rounded-2xl border p-4 mb-8 transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or username..."
              className={`w-full md:w-80 rounded-xl px-4 py-2 border focus:outline-none focus:border-yellow-400 transition ${
                isDark
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              }`}
            />

            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`rounded-xl px-4 py-2 border focus:outline-none focus:border-yellow-400 transition ${
                  isDark
                    ? 'bg-gray-800 text-white border-gray-700'
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                }`}
              >
                <option value="rating">Rating</option>
                <option value="xp">XP</option>
                <option value="solved">Solved</option>
                <option value="wins">Battle Wins</option>
                <option value="streak">Streak</option>
                <option value="submissions">Submissions</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : error ? (
          <div className={`rounded-2xl border p-6 text-center ${isDark ? 'bg-red-900/10 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}>
            No users found for this leaderboard.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {topThree.map((user, index) => (
                <div
                  key={user.userId}
                  className={`rounded-2xl border p-6 text-center transition ${getCardStyles(index)}`}
                >
                  <div className="text-4xl mb-3">{rankIcon(user.rank)}</div>

                  <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold ${
                    index === 0
                      ? 'bg-yellow-400 text-gray-950'
                      : isDark
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    {user.avatarLetter}
                  </div>

                  <div className="text-lg font-bold">{user.displayName}</div>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>@{user.username}</div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-yellow-400 font-bold">{user.rating}</div>
                      <div className="text-gray-400">Rating</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">{user.level}</div>
                      <div className="text-gray-400">Level</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-bold">{user.solvedCount}</div>
                      <div className="text-gray-400">Solved</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-bold">{user.xp.toLocaleString()}</div>
                      <div className="text-gray-400">XP</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`rounded-2xl border overflow-hidden transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className={`grid grid-cols-8 gap-4 px-6 py-4 text-sm font-semibold ${isDark ? 'bg-gray-950 text-gray-400 border-b border-gray-800' : 'bg-gray-50 text-gray-600 border-b border-gray-200'}`}>
                <div>Rank</div>
                <div className="col-span-2">User</div>
                <div>Level</div>
                <div>Rating</div>
                <div>Solved</div>
                <div>Wins</div>
                <div>XP</div>
              </div>

              {filteredUsers.map((user) => (
                <div
                  key={user.userId}
                  className={`grid grid-cols-8 gap-4 px-6 py-4 items-center transition ${isDark ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'} last:border-b-0`}
                >
                  <div className="font-bold text-lg">{rankIcon(user.rank)}</div>

                  <div className="col-span-2 flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'}`}>
                      {user.avatarLetter}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{user.displayName}</div>
                      <div className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-400/10 text-blue-400">
                      Level {user.level}
                    </span>
                  </div>

                  <div className="font-bold text-yellow-400">{user.rating}</div>
                  <div>{user.solvedCount}</div>
                  <div>{user.battlesWon}</div>
                  <div className="font-semibold">{user.xp.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {remainingUsers.length > 0 && (
              <div className={`mt-6 rounded-2xl border p-4 transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {filteredUsers.length} ranked account{filteredUsers.length > 1 ? 's' : ''} from the database.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;