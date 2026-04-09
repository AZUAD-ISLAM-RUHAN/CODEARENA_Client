import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../components/NotificationDropdown';

function Battle() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
          Code<span className="text-yellow-400">Arena</span>
        </h1>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition">Dashboard</button>
          <button type="button" onClick={() => navigate('/problems')} className="text-gray-400 hover:text-white transition">Problems</button>
          <button type="button" onClick={() => navigate('/contest')} className="text-gray-400 hover:text-white transition">Contests</button>
          <button type="button" onClick={() => navigate('/leaderboard')} className="text-gray-400 hover:text-white transition">Leaderboard</button>
          
          
          
          <div className="relative group">
            <button type="button" className="w-9 h-9 rounded-full bg-yellow-400 text-gray-950 font-bold flex items-center justify-center">
              A
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="py-2">
                <button 
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                  👤 Profile
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                  ⚙️ Settings
                </button>
                <hr className="border-gray-800 my-2" />
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition"
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
          <div className="bg-gray-900 border border-yellow-400/30 rounded-xl p-6 hover:border-yellow-400 transition cursor-pointer group">
            <div className="text-4xl mb-3">⚔️</div>
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition">1v1 Ranked</h3>
            <p className="text-gray-400 text-sm mt-2">Compete for ELO rating. Win to climb the leaderboard!</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400"><span>🟢 234 online</span></div>
            <button 
              type="button"
              onClick={() => handleFindMatch('ranked')}
              disabled={findingMatch}
              className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {findingMatch ? '⏳ Finding Match...' : 'Find Match'}
            </button>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition cursor-pointer group">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition">1v1 Unranked</h3>
            <p className="text-gray-400 text-sm mt-2">Practice battles without affecting your rating.</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400"><span>🟢 189 online</span></div>
            <button 
              type="button"
              onClick={() => handleFindMatch('unranked')}
              disabled={findingMatch}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {findingMatch ? '⏳ Finding Match...' : 'Find Match'}
            </button>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition cursor-pointer group">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition">Challenge Friend</h3>
            <p className="text-gray-400 text-sm mt-2">Send a battle invite link to your friend.</p>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter username..."
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition"
              />
            </div>
            <button
              type="button"
              onClick={handleSendInvite}
              className="mt-3 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-lg transition"
            >
              Send Invite
            </button>
            {inviteStatus && (
              <p className="mt-3 text-sm text-green-400">{inviteStatus}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button type="button" onClick={() => setActiveTab('lobby')}
            className={`pb-3 px-1 font-medium transition ${activeTab === 'lobby' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}>
            🔴 Live Battles
          </button>
          <button type="button" onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 font-medium transition ${activeTab === 'history' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}>
            📋 My Battle History
          </button>
        </div>
        
        {activeTab === 'lobby' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {loadingBattles ? (
              <div className="px-6 py-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-3"></div>
                <p>Loading live battles...</p>
              </div>
            ) : activeBattles.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400">
                <p>No active battles right now. Be the first to start one! 🚀</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="text-left px-6 py-4">Players</th>
                    <th className="text-left px-6 py-4">Problem</th>
                    <th className="text-left px-6 py-4">Time</th>
                    <th className="text-left px-6 py-4">Status</th>
                    <th className="text-left px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBattles.map((battle) => (
                    <tr key={battle._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{battle.participants?.[0]?.username || 'Player 1'}</span>
                        <span className="text-yellow-400 mx-2">vs</span>
                        <span className="text-white font-medium">{battle.participants?.[1]?.username || 'Player 2'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{battle.problem?.title || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-400">⏱️ {battle.timeLimit || 15} min</td>
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
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {loadingBattles ? (
              <div className="px-6 py-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-3"></div>
                <p>Loading your battle history...</p>
              </div>
            ) : recentBattles.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400">
                <p>No battles in your history yet. Start your first battle! ⚔️</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="text-left px-6 py-4">Opponent</th>
                    <th className="text-left px-6 py-4">Problem</th>
                    <th className="text-left px-6 py-4">Result</th>
                    <th className="text-left px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBattles.map((battle) => (
                    <tr key={battle._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 text-white font-medium">{battle.participants?.find(p => p.userId?.toString() !== (user._id || user.id))?.userId?.username || 'Opponent'}</td>
                      <td className="px-6 py-4 text-gray-300">{battle.problem?.title || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${battle.winner?.toString() === (user._id || user.id) ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                          {battle.winner?.toString() === (user._id || user.id) ? '🏆 Won' : '💀 Lost'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{new Date(battle.createdAt).toLocaleDateString()}</td>
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