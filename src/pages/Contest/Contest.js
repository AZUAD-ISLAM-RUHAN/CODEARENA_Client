import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../components/NotificationDropdown';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Contest() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);

  const [user] = useState(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) return JSON.parse(currentUser);

      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) return JSON.parse(userProfile);

      return {
        name: 'User',
        username: 'user',
        email: '',
        photoUrl: null,
        level: 1,
        experience: 0,
        rank: 0,
        _id: null
      };
    } catch (error) {
      return {
        name: 'User',
        username: 'user',
        email: '',
        photoUrl: null,
        level: 1,
        experience: 0,
        rank: 0,
        _id: null
      };
    }
  });

  const currentUserId = user?._id || user?.id || null;

  const mapContestStatus = (status) => {
    if (status === 'scheduled') return 'upcoming';
    if (status === 'ongoing') return 'ongoing';
    return 'ended';
  };

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/contests?limit=100');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contests');
      }

      setContests(data.contests || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const newTimeLeft = {};

      contests.forEach((contest) => {
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);
        const uiStatus = mapContestStatus(contest.status);

        if (uiStatus === 'upcoming') {
          const diff = start - now;
          newTimeLeft[contest._id] = diff > 0 ? formatCountdown(diff) : 'Starting now...';
        } else if (uiStatus === 'ongoing') {
          const diff = end - now;
          newTimeLeft[contest._id] = diff > 0 ? formatCountdown(diff) : 'Ending...';
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [contests]);

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

  const isRegistered = (contest) => {
    const participants = Array.isArray(contest.participants) ? contest.participants : [];
    return participants.some((participant) => {
      const participantId =
        participant && typeof participant === 'object'
          ? participant._id || participant.userId || participant.id
          : participant;
      return String(participantId) === String(currentUserId);
    });
  };

  const handleRegister = async (contestId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setRequestingId(contestId);

      const response = await fetch(`http://localhost:5001/api/contests/${contestId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to join contest');
        return;
      }

      await fetchContests();
    } catch (error) {
      console.error('Join contest error:', error);
      alert('Failed to join contest');
    } finally {
      setRequestingId(null);
    }
  };

  const handleUnregister = async (contestId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setRequestingId(contestId);

      const response = await fetch(`http://localhost:5001/api/contests/${contestId}/leave`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to leave contest');
        return;
      }

      await fetchContests();
    } catch (error) {
      console.error('Leave contest error:', error);
      alert('Failed to leave contest');
    } finally {
      setRequestingId(null);
    }
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
    if (!diff) return 'text-gray-400';
    if (String(diff).includes('Easy') || String(diff).includes('Beginner')) return 'text-green-400';
    if (String(diff).includes('Medium') || String(diff).includes('Intermediate') || String(diff).includes('Mixed')) return 'text-yellow-400';
    if (String(diff).includes('Hard') || String(diff).includes('Expert') || String(diff).includes('Advanced')) return 'text-red-400';
    return 'text-gray-400';
  };

  const filteredContests = useMemo(() => {
    return contests.filter((contest) => mapContestStatus(contest.status) === activeTab);
  }, [contests, activeTab]);

  const upcomingCount = contests.filter((contest) => mapContestStatus(contest.status) === 'upcoming').length;
  const ongoingCount = contests.filter((contest) => mapContestStatus(contest.status) === 'ongoing').length;
  const endedCount = contests.filter((contest) => mapContestStatus(contest.status) === 'ended').length;
  const participatedCount = contests.filter((contest) => isRegistered(contest)).length;
  const winsCount = contests.reduce((sum, contest) => {
    const row = (contest.leaderboard || []).find((entry) => {
      const entryUserId =
        entry?.userId && typeof entry.userId === 'object'
          ? entry.userId._id || entry.userId.id
          : entry?.userId;
      return String(entryUserId) === String(currentUserId);
    });

    if (row && row.rank === 1) return sum + 1;
    return sum;
  }, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Contest <span className="text-yellow-400">Arena</span></h2>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Compete in timed contests, earn real rating, and climb the ranks.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`border rounded-xl p-4 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl font-bold text-blue-400">{upcomingCount}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming</div>
          </div>
          <div className={`border rounded-xl p-4 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl font-bold text-green-400">{ongoingCount}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Live Now</div>
          </div>
          <div className={`border rounded-xl p-4 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl font-bold text-purple-400">{participatedCount}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Participated</div>
          </div>
          <div className={`border rounded-xl p-4 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-2xl font-bold text-yellow-400">{winsCount}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contest Wins</div>
          </div>
        </div>

        <div className={`flex gap-1 mb-6 p-1 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
          {[
            { id: 'upcoming', label: '🔔 Upcoming', count: upcomingCount },
            { id: 'ongoing', label: '🔴 Live Now', count: ongoingCount },
            { id: 'ended', label: '🏁 Past', count: endedCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-yellow-400 text-gray-950'
                  : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-gray-950 text-yellow-400'
                  : isDark
                  ? 'bg-gray-800 text-gray-400'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading contests...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContests.length === 0 ? (
              <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="text-4xl mb-3">📭</div>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No {activeTab} contests found</p>
              </div>
            ) : (
              filteredContests.map((contest) => {
                const uiStatus = mapContestStatus(contest.status);
                const joined = isRegistered(contest);
                const participantCount = contest.participantCount || (contest.participants ? contest.participants.length : 0);

                return (
                  <div
                    key={contest._id}
                    className={`border rounded-xl p-6 transition ${
                      uiStatus === 'ongoing'
                        ? isDark
                          ? 'bg-gray-900 border-green-400/50 shadow-lg shadow-green-400/10'
                          : 'bg-white border-green-300 shadow-lg shadow-green-100'
                        : isDark
                        ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          🏆
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{contest.title}</h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(uiStatus)}`}>
                              {uiStatus === 'ongoing' ? '🔴 LIVE' : uiStatus}
                            </span>
                            {joined && uiStatus !== 'ended' && (
                              <span className="text-xs bg-green-400/10 text-green-400 px-2 py-1 rounded-full">
                                ✓ Registered
                              </span>
                            )}
                          </div>

                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{contest.description}</p>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>📅 {formatDate(contest.startTime)}</span>
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>⏱️ {contest.duration} min</span>
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>📚 {(contest.problemIds || []).length} problems</span>
                            <span className={`font-medium ${getDifficultyColor(contest.difficulty)}`}>⚡ {contest.difficulty || 'Mixed'}</span>
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                              👥 {participantCount}{contest.maxParticipants ? `/${contest.maxParticipants}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {uiStatus === 'upcoming' && (
                          <div className="text-right">
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Starts in</div>
                            <div className="text-xl font-mono font-bold text-blue-400">
                              {timeLeft[contest._id] || 'Calculating...'}
                            </div>
                          </div>
                        )}

                        {uiStatus === 'ongoing' && (
                          <div className="text-right">
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ends in</div>
                            <div className="text-xl font-mono font-bold text-green-400 animate-pulse">
                              {timeLeft[contest._id] || 'Calculating...'}
                            </div>
                          </div>
                        )}

                        {uiStatus === 'ended' && (
                          <div className="text-right">
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</div>
                            <div className="text-lg font-bold text-yellow-400">Finalized Results</div>
                          </div>
                        )}

                        {uiStatus === 'upcoming' && (
                          joined ? (
                            <button
                              onClick={() => handleUnregister(contest._id)}
                              disabled={requestingId === contest._id}
                              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
                            >
                              {requestingId === contest._id ? 'Working...' : 'Leave'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(contest._id)}
                              disabled={requestingId === contest._id}
                              className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-6 py-2 rounded-lg transition disabled:opacity-50"
                            >
                              {requestingId === contest._id ? 'Working...' : 'Register Now'}
                            </button>
                          )
                        )}

                        {uiStatus === 'ongoing' && (
                          joined ? (
                            <button
                              onClick={() => handleEnterContest(contest._id)}
                              className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2 rounded-lg transition animate-pulse"
                            >
                              Enter Contest →
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(contest._id)}
                              disabled={requestingId === contest._id}
                              className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-6 py-2 rounded-lg transition disabled:opacity-50"
                            >
                              {requestingId === contest._id ? 'Working...' : 'Join Live'}
                            </button>
                          )
                        )}

                        {uiStatus === 'ended' && (
                          <button
                            onClick={() => handleEnterContest(contest._id)}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-6 py-2 rounded-lg transition"
                          >
                            View Results
                          </button>
                        )}
                      </div>
                    </div>

                    {uiStatus === 'upcoming' && contest.maxParticipants ? (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Registration</span>
                          <span>{Math.round((participantCount / contest.maxParticipants) * 100)}% full</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                          <div
                            className="h-full bg-blue-400 rounded-full transition-all"
                            style={{ width: `${Math.min((participantCount / contest.maxParticipants) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Contest;