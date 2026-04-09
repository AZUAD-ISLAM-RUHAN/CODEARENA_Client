import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../components/NotificationDropdown';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Contest() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [registeredContests, setRegisteredContests] = useState([2]);
  const [user] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      return JSON.parse(currentUser);
    }
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      return JSON.parse(userProfile);
    }
    return { 
      name: 'User',
      username: 'user',
      email: '',
      photoUrl: null,
      level: 'Beginner',
      xp: 0,
      rank: 0
    };
  });

  const [contests, setContests] = useState([
    {
      id: 1,
      title: 'Weekly Contest 15',
      description: 'Standard weekly contest with mixed difficulty problems',
      startTime: new Date(Date.now() + 86400000 * 2),
      endTime: new Date(Date.now() + 86400000 * 2 + 5400000),
      duration: 90,
      problems: 4,
      participants: 342,
      maxParticipants: 500,
      prizes: ['🏆 500 XP', '🥈 300 XP', '🥉 200 XP'],
      difficulty: 'Mixed',
      status: 'upcoming',
      registered: false,
      image: '🏆',
      results: []
    },
    {
      id: 2,
      title: 'CSE Intra Department',
      description: 'Battle for CSE department supremacy!',
      startTime: new Date(Date.now() - 1800000),
      endTime: new Date(Date.now() + 5400000),
      duration: 120,
      problems: 6,
      participants: 89,
      maxParticipants: 200,
      prizes: ['🏆 Trophy', '🥇 1000 XP', '🎖 Badge'],
      difficulty: 'Medium-Hard',
      status: 'ongoing',
      registered: true,
      image: '⚔️'
    },
    {
      id: 3,
      title: 'Beginner Friendly #12',
      description: 'Perfect for newcomers to competitive programming',
      startTime: new Date(Date.now() + 86400000 * 5),
      endTime: new Date(Date.now() + 86400000 * 5 + 3600000),
      duration: 60,
      problems: 3,
      participants: 156,
      maxParticipants: 1000,
      prizes: ['🌟 200 XP', '📚 Certificate'],
      difficulty: 'Easy',
      status: 'upcoming',
      registered: false,
      image: '🌱'
    },
    {
      id: 4,
      title: 'New Year Special 2024',
      description: 'Grand contest to celebrate the new year',
      startTime: new Date(Date.now() - 86400000 * 10),
      endTime: new Date(Date.now() - 86400000 * 10 + 7200000),
      duration: 120,
      problems: 8,
      participants: 567,
      maxParticipants: 1000,
      prizes: ['👑 Legend Badge', '🏆 2000 XP', '🎁 Mystery Prize'],
      difficulty: 'Hard',
      status: 'ended',
      registered: true,
      image: '🎉',
      myRank: 42,
      solved: 5,
      totalParticipants: 567,
      results: [
        { rank: 1, name: 'Rakib Hassan', score: 950, penalty: '12m' },
        { rank: 2, name: 'Sadia Islam', score: 910, penalty: '15m' },
        { rank: 3, name: 'Nabil Ahmed', score: 880, penalty: '18m' },
        { rank: 42, name: 'You', score: 620, penalty: '45m' }
      ]
    },
    {
      id: 5,
      title: 'Algorithm Master',
      description: 'Advanced algorithms and data structures',
      startTime: new Date(Date.now() - 86400000 * 3),
      endTime: new Date(Date.now() - 86400000 * 3 + 10800000),
      duration: 180,
      problems: 5,
      participants: 234,
      maxParticipants: 300,
      prizes: ['🎯 Expert Badge', '🏆 1500 XP'],
      difficulty: 'Expert',
      status: 'ended',
      registered: false,
      image: '🧠',
      results: [
        { rank: 1, name: 'Tanha Begum', score: 860, penalty: '20m' },
        { rank: 2, name: 'Rifat Hossain', score: 840, penalty: '22m' },
        { rank: 3, name: 'Rakib Hassan', score: 820, penalty: '25m' }
      ]
    }
  ]);

  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const newTimeLeft = {};

      contests.forEach(contest => {
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);

        if (contest.status === 'upcoming') {
          const diff = start - now;
          if (diff > 0) {
            newTimeLeft[contest.id] = formatCountdown(diff);
          } else {
            newTimeLeft[contest.id] = 'Starting now...';
          }
        } else if (contest.status === 'ongoing') {
          const diff = end - now;
          if (diff > 0) {
            newTimeLeft[contest.id] = formatCountdown(diff);
          } else {
            newTimeLeft[contest.id] = 'Ending...';
          }
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (ms) => {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegister = (contestId) => {
    setRegisteredContests(prev => prev.includes(contestId) ? prev : [...prev, contestId]);
    setContests(prev => prev.map(c => c.id === contestId ? {
      ...c,
      registered: true,
      participants: c.participants + 1
    } : c));
  };

  const handleUnregister = (contestId) => {
    setRegisteredContests(prev => prev.filter(id => id !== contestId));
    setContests(prev => prev.map(c => c.id === contestId ? {
      ...c,
      registered: false,
      participants: Math.max(0, c.participants - 1)
    } : c));
  };

  const isRegistered = (contestId) => {
    const contest = contests.find(c => c.id === contestId);
    return registeredContests.includes(contestId) || (contest && contest.registered);
  };

  const handleEnterContest = (contestId) => {
    navigate(`/contest/${contestId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'text-blue-400 bg-blue-400/10',
      ongoing: 'text-green-400 bg-green-400/10 animate-pulse',
      ended: 'text-gray-400 bg-gray-400/10'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  const getDifficultyColor = (diff) => {
    if (diff.includes('Easy')) return 'text-green-400';
    if (diff.includes('Medium')) return 'text-yellow-400';
    if (diff.includes('Hard') || diff.includes('Expert')) return 'text-red-400';
    return 'text-gray-400';
  };

  const filteredContests = contests.filter(c => c.status === activeTab);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    navigate('/');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
          Code<span className="text-yellow-400">Arena</span>
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Dashboard</button>
          <button onClick={() => navigate('/problems')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Problems</button>
          <button onClick={() => navigate('/battle')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Battle</button>
          <button onClick={() => navigate('/leaderboard')} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Leaderboard</button>
          
          <ThemeToggle />

          <NotificationDropdown />
          
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
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </button>
            )}
            <div className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="py-2">
                <button 
                  onClick={() => navigate('/profile')}
                  className={`w-full text-left px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  👤 Profile
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className={`w-full text-left px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  ⚙️ Settings
                </button>
                <hr className={`my-2 ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
                <button 
                  onClick={handleLogout}
                  className={`w-full text-left px-4 py-2 transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Contest <span className="text-yellow-400">Arena</span></h2>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Compete in timed contests, win prizes, climb the ranks!</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`border rounded-xl p-4 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl font-bold text-blue-400">3</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming</div>
          </div>
          <div className={`border rounded-xl p-4 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl font-bold text-green-400">1</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Live Now</div>
          </div>
          <div className={`border rounded-xl p-4 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl font-bold text-purple-400">12</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Participated</div>
          </div>
          <div className={`border rounded-xl p-4 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl font-bold text-yellow-400">🏆</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>2 Wins</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {[
            { id: 'upcoming', label: '🔔 Upcoming', count: contests.filter(c => c.status === 'upcoming').length },
            { id: 'ongoing', label: '🔴 Live Now', count: contests.filter(c => c.status === 'ongoing').length },
            { id: 'ended', label: '🏁 Past', count: contests.filter(c => c.status === 'ended').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-yellow-400 text-gray-950'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-gray-950 text-yellow-400' : 'bg-gray-800 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contest List */}
        <div className="space-y-4">
          {filteredContests.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400">No {activeTab} contests found</p>
            </div>
          ) : (
            filteredContests.map((contest) => (
              <div 
                key={contest.id} 
                className={`bg-gray-900 border rounded-xl p-6 transition ${
                  contest.status === 'ongoing' 
                    ? 'border-green-400/50 shadow-lg shadow-green-400/10' 
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {contest.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{contest.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(contest.status)}`}>
                          {contest.status === 'ongoing' ? '🔴 LIVE' : contest.status}
                        </span>
                        {isRegistered(contest.id) && contest.status !== 'ended' && (
                          <span className="text-xs bg-green-400/10 text-green-400 px-2 py-1 rounded-full">
                            ✓ Registered
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{contest.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                        <span className="text-gray-300">📅 {formatDate(contest.startTime)}</span>
                        <span className="text-gray-300">⏱️ {contest.duration} min</span>
                        <span className="text-gray-300">📚 {contest.problems} problems</span>
                        <span className={`font-medium ${getDifficultyColor(contest.difficulty)}`}>
                          ⚡ {contest.difficulty}
                        </span>
                        <span className="text-gray-300">👥 {contest.participants}/{contest.maxParticipants}</span>
                      </div>

                      {/* Prizes */}
                      <div className="flex gap-2 mt-3">
                        {contest.prizes.map((prize, idx) => (
                          <span key={idx} className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded-full">
                            {prize}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {/* Countdown or Result */}
                    {contest.status === 'upcoming' && (
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Starts in</div>
                        <div className="text-xl font-mono font-bold text-blue-400">
                          {timeLeft[contest.id] || 'Calculating...'}
                        </div>
                      </div>
                    )}
                    
                    {contest.status === 'ongoing' && (
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Ends in</div>
                        <div className="text-xl font-mono font-bold text-green-400 animate-pulse">
                          {timeLeft[contest.id] || 'Calculating...'}
                        </div>
                      </div>
                    )}

                    {contest.status === 'ended' && contest.myRank && (
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Your Rank</div>
                        <div className="text-2xl font-bold text-yellow-400">#{contest.myRank}</div>
                        <div className="text-xs text-gray-500">of {contest.totalParticipants}</div>
                      </div>
                    )}

                    {/* ✅ FIXED: Buttons with proper onClick */}
                    {contest.status === 'upcoming' && (
                      isRegistered(contest.id) ? (
                        <button
                          onClick={() => handleUnregister(contest.id)}
                          className="bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium px-6 py-2 rounded-lg transition"
                        >
                          Leave
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(contest.id)}
                          className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-6 py-2 rounded-lg transition"
                        >
                          Register Now
                        </button>
                      )
                    )}

                    {contest.status === 'ongoing' && (
                      isRegistered(contest.id) ? (
                        <button
                          onClick={() => handleEnterContest(contest.id)}
                          className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2 rounded-lg transition animate-pulse"
                        >
                          Enter Contest →
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(contest.id)}
                          className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-6 py-2 rounded-lg transition"
                        >
                          Join Live
                        </button>
                      )
                    )}

                    {contest.status === 'ended' && (
                      <button
                        onClick={() => handleEnterContest(contest.id)}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-6 py-2 rounded-lg transition"
                      >
                        View Results
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar for registration */}
                {contest.status === 'upcoming' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Registration</span>
                      <span>{Math.round((contest.participants / contest.maxParticipants) * 100)}% full</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full transition-all"
                        style={{ width: `${(contest.participants / contest.maxParticipants) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        
      </div>
    </div>
  );
}

export default Contest;