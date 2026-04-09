import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../components/NotificationDropdown';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Battle() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('lobby');
  const [findingMatch, setFindingMatch] = useState(false);
  const [activeBattles, setActiveBattles] = useState([]);
  const [recentBattles, setRecentBattles] = useState([]);
  const [loadingBattles, setLoadingBattles] = useState(true);
  const [friendUsername, setFriendUsername] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [user] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) return JSON.parse(currentUser);
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) return JSON.parse(userProfile);
    return { firstName: 'User', photoUrl: null };
  });

  // Fetch real battles from API
  useEffect(() => {
    const fetchBattles = async () => {
      try {
        setLoadingBattles(true);
        const token = localStorage.getItem('token');
        
        // Fetch active battles
        const activeBattlesResp = await fetch('http://localhost:5001/api/battles?status=active&limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const activeBattlesData = await activeBattlesResp.json();
        setActiveBattles(activeBattlesData.battles || []);

        // Fetch recent battles for current user
        if (user._id || user.id) {
          const recentBattlesResp = await fetch(`http://localhost:5001/api/battles/user/${user._id || user.id}?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const recentBattlesData = await recentBattlesResp.json();
          setRecentBattles(recentBattlesData.battles || []);
        }
      } catch (error) {
        console.error('Error fetching battles:', error);
        // Show fallback empty state
        setActiveBattles([]);
        setRecentBattles([]);
      } finally {
        setLoadingBattles(false);
      }
    };

    fetchBattles();
  }, [user]);

  const handleFindMatch = (type = 'ranked') => {
    setFindingMatch(true);
    setTimeout(() => {
      setFindingMatch(false);
      const battleId = Math.random().toString(36).substring(7);
      navigate(`/battle/${battleId}`);
    }, 1500);
  };

  const handleSendInvite = () => {
    if (!friendUsername.trim()) {
      setInviteStatus('Please enter a username to challenge.');
      return;
    }

    const inviteLink = `${window.location.origin}/battle/${Math.random().toString(36).substring(7)}`;
    setInviteStatus(`Invite sent to ${friendUsername}! Link copied to clipboard.`);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteLink).catch(() => {
        setInviteStatus(`Invite link ready: ${inviteLink}`);
      });
    }
  };

  const handleWatchBattle = (battleId) => {
    if (!battleId) return;
    navigate(`/battle/${battleId}`);
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
          <button type="button" onClick={() => navigate('/dashboard')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Dashboard</button>
          <button type="button" onClick={() => navigate('/problems')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Problems</button>
          <button type="button" onClick={() => navigate('/contest')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Contests</button>
          <button type="button" onClick={() => navigate('/leaderboard')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Leaderboard</button>
          
          <ThemeToggle />
          
          <div className="relative group">
            <button type="button" className="w-9 h-9 rounded-full bg-yellow-400 text-gray-950 font-bold flex items-center justify-center">
              A
            </button>
            <div className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="py-2">
                <button 
                  type="button"
                  onClick={() => navigate('/profile')}
                  className={`w-full text-left px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  👤 Profile
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/profile')}
                  className={`w-full text-left px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  ⚙️ Settings
                </button>
                <hr className={`my-2 ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
                <button 
                  type="button"
                  onClick={handleLogout}
                  className={`w-full text-left px-4 py-2 transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                >
                  🚪 Logout
                </button>
                
              </div>
            </div>
          </div>
          <NotificationDropdown />
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Battle <span className="text-yellow-400">Arena</span></h2>
          <p className="text-gray-400 mt-1">Challenge others, prove your skills!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`border rounded-xl p-6 hover:border-yellow-400 transition cursor-pointer group ${isDark ? 'bg-gray-900 border-yellow-400/30' : 'bg-gray-50 border-yellow-200'}`}>
            <div className="text-4xl mb-3">⚔️</div>
            <h3 className={`text-xl font-bold transition-colors group-hover:text-yellow-400 ${isDark ? 'text-white' : 'text-gray-900'}`}>1v1 Ranked</h3>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Compete for ELO rating. Win to climb the leaderboard!</p>
            <div className={`mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><span>🟢 234 online</span></div>
            <button 
              type="button"
              onClick={() => handleFindMatch('ranked')}
              disabled={findingMatch}
              className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {findingMatch ? '⏳ Finding Match...' : 'Find Match'}
            </button>
          </div>
          
          <div className={`border rounded-xl p-6 hover:border-gray-600 transition cursor-pointer group ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-4xl mb-3">🎮</div>
            <h3 className={`text-xl font-bold transition-colors group-hover:text-yellow-400 ${isDark ? 'text-white' : 'text-gray-900'}`}>1v1 Unranked</h3>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Practice battles without affecting your rating.</p>
            <div className={`mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><span>🟢 189 online</span></div>
            <button 
              type="button"
              onClick={() => handleFindMatch('unranked')}
              disabled={findingMatch}
              className={`mt-4 w-full font-bold py-2.5 rounded-lg transition disabled:opacity-50 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              {findingMatch ? '⏳ Finding Match...' : 'Find Match'}
            </button>
          </div>
          
          <div className={`border rounded-xl p-6 hover:border-gray-600 transition cursor-pointer group ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-4xl mb-3">🤝</div>
            <h3 className={`text-xl font-bold transition-colors group-hover:text-yellow-400 ${isDark ? 'text-white' : 'text-gray-900'}`}>Challenge Friend</h3>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Send a battle invite link to your friend.</p>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter username..."
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              />
            </div>
            <button
              type="button"
              onClick={handleSendInvite}
              className={`mt-3 w-full font-bold py-2.5 rounded-lg transition ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              Send Invite
            </button>
            {inviteStatus && (
              <p className="mt-3 text-sm text-green-400">{inviteStatus}</p>
            )}
          </div>
        </div>
        
        <div className={`flex gap-4 mb-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <button type="button" onClick={() => setActiveTab('lobby')}
            className={`pb-3 px-1 font-medium transition ${activeTab === 'lobby' ? 'text-yellow-400 border-b-2 border-yellow-400' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            🔴 Live Battles
          </button>
          <button type="button" onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 font-medium transition ${activeTab === 'history' ? 'text-yellow-400 border-b-2 border-yellow-400' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            📋 My Battle History
          </button>
        </div>
        
        {activeTab === 'lobby' && (
          <div className={`border rounded-xl overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            {loadingBattles ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-3"></div>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading live battles...</p>
              </div>
            ) : activeBattles.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No active battles right now. Be the first to start one! 🚀</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className={`border-b text-sm ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                    <th className="text-left px-6 py-4">Players</th>
                    <th className="text-left px-6 py-4">Problem</th>
                    <th className="text-left px-6 py-4">Time</th>
                    <th className="text-left px-6 py-4">Status</th>
                    <th className="text-left px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBattles.map((battle) => (
                    <tr key={battle._id} className={`border-b last:border-0 transition-colors ${isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{battle.participants?.[0]?.username || 'Player 1'}</span>
                        <span className="text-yellow-400 mx-2">vs</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{battle.participants?.[1]?.username || 'Player 2'}</span>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{battle.problem?.title || 'Unknown'}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>⏱️ {battle.timeLimit || 15} min</td>
                      <td className="px-6 py-4">
                        <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-full animate-pulse">🔴 {battle.status || 'Active'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleWatchBattle(battle._id)}
                          className="text-yellow-400 hover:underline text-sm"
                        >
                          Watch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className={`border rounded-xl overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            {loadingBattles ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-3"></div>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading your battle history...</p>
              </div>
            ) : recentBattles.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No battles in your history yet. Start your first battle! ⚔️</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className={`border-b text-sm ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                    <th className="text-left px-6 py-4">Opponent</th>
                    <th className="text-left px-6 py-4">Problem</th>
                    <th className="text-left px-6 py-4">Result</th>
                    <th className="text-left px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBattles.map((battle) => (
                    <tr key={battle._id} className={`border-b last:border-0 transition-colors ${isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{battle.participants?.find(p => p.userId?.toString() !== (user._id || user.id))?.userId?.username || 'Opponent'}</td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{battle.problem?.title || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${battle.winner?.toString() === (user._id || user.id) ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                          {battle.winner?.toString() === (user._id || user.id) ? '🏆 Won' : '💀 Lost'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(battle.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Battle;