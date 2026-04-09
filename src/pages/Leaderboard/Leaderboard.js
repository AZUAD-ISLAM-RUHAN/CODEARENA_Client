import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../components/NotificationDropdown';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Leaderboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('global');
  const [globalUsers, setGlobalUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user);
    }
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      return JSON.parse(userProfile);
    }
    return { firstName: 'User', username: 'user', experience: 0, solvedProblems: [], rating: 1200, streak: 0, level: 1 };
  });

  // Fetch real leaderboard from API
  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/leaderboard?sortBy=rating&limit=50');
        const data = await response.json();
        if (data.leaderboard) {
          const users = data.leaderboard.map((entry, index) => ({
            rank: index + 1,
            name: entry.userId ? entry.userId.username : 'Unknown',
            xp: entry.totalPoints || 0,
            solved: entry.problemsSolved || 0,
            winRate: entry.winRate || '0%',
            level: entry.userId ? entry.userId.level : 1,
            rating: entry.rating || 1200
          }));
          setGlobalUsers(users);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setGlobalUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const levelColor = {
    Legend: 'text-yellow-400 bg-yellow-400/10',
    Expert: 'text-purple-400 bg-purple-400/10',
    Coder: 'text-blue-400 bg-blue-400/10',
    Novice: 'text-green-400 bg-green-400/10',
  };

  const rankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <nav className={`border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
          Code<span className="text-yellow-400">Arena</span>
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Dashboard</button>
          <button onClick={() => navigate('/problems')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Problems</button>
          <button onClick={() => navigate('/battle')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Battle</button>
          <button onClick={() => navigate('/contest')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Contests</button>
          
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
                {currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A')}
              </button>
            )}
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="py-2">
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                  👤 Profile
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                  ⚙️ Settings
                </button>
                <hr className="border-gray-800 my-2" />
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
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Leader<span className="text-yellow-400">board</span></h2>
          <p className="text-gray-400 mt-1">Top coders on CodeArena!</p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
        <>
        {/* Top 3 Users */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {globalUsers.slice(0, 3).map((user, idx) => (
            <div key={idx} className={`bg-gray-900 ${idx === 0 ? 'border-yellow-400/50' : 'border-gray-800'} border rounded-xl p-6 text-center ${idx === 0 ? 'shadow-lg shadow-yellow-400/10' : ''}`}>
              <div className="text-4xl mb-2">{['🥇', '🥈', '🥉'][idx]}</div>
              <div className={`w-${idx === 0 ? '16' : '14'} h-${idx === 0 ? '16' : '14'} rounded-full ${idx === 0 ? 'bg-yellow-400' : 'bg-gray-700'} flex items-center justify-center text-xl font-bold mx-auto mb-2 ${idx === 0 ? 'text-gray-950' : ''}`}>{user.name[0]}</div>
              <div className="font-semibold text-white">{user.name}</div>
              <div className="text-yellow-400 font-bold mt-2">{user.xp.toLocaleString()} XP</div>
              <div className="text-gray-400 text-sm">{user.solved} solved</div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          {['global', 'department', 'batch'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium capitalize transition ${activeTab === tab ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}>
              {tab === 'global' ? '🌐 Global' : tab === 'department' ? '🏫 Department' : '📅 Batch'}
            </button>
          ))}
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="text-left px-6 py-4">Rank</th>
                <th className="text-left px-6 py-4">Student</th>
                <th className="text-left px-6 py-4">Level</th>
                <th className="text-left px-6 py-4">Rating</th>
                <th className="text-left px-6 py-4">Solved</th>
              </tr>
            </thead>
            <tbody>
              {globalUsers.map((user) => (
                <tr key={user.rank}
                  className={`border-b border-gray-800 last:border-0 transition hover:bg-gray-800/50`}>
                  <td className="px-6 py-4 text-xl font-bold">{rankIcon(user.rank)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm">{user.name[0]}</div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-400/10 text-blue-400">Level {user.level}</span>
                  </td>
                  <td className="px-6 py-4 text-yellow-400 font-bold">{user.rating}</td>
                  <td className="px-6 py-4 text-gray-300">{user.solved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;