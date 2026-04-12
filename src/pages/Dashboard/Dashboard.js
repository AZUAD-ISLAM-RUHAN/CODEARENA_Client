import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotificationDropdown from '../../components/NotificationDropdown';
import ThemeToggle from '../../components/ThemeToggle';
import GlobalSearchBar from '../../components/GlobalSearchBar';
import DailyStreak from '../../components/DailyStreak';
import LevelUpModal from '../../components/LevelUpModal';
import { useTheme } from '../../context/ThemeContext';

function Dashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  // ✅ FIXED: Proper admin check
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('User');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5001/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
          setUserName(data.user.firstName || data.user.username);
          setUserLevel(data.user.level || 1);
          
          // Check if admin
          const adminStatus = data.user.role === 'admin';
          setIsAdmin(adminStatus);
          localStorage.setItem('isAdmin', adminStatus.toString());
          
          // Store user data for other components
          localStorage.setItem('currentUser', JSON.stringify(data.user));

          // Fetch daily challenge
          await fetchDailyChallenge(data.user);
        } else {
          // Token invalid, redirect to login
          localStorage.clear();
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.clear();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch daily challenge - random unsolved problem
  const fetchDailyChallenge = async (user) => {
    try {
      const token = localStorage.getItem('token');
      
      // Get user's solved problems
      const solvedProblemIds = user.solvedProblems || [];
      
      // Fetch all problems
      const response = await fetch('http://localhost:5001/api/problems?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allProblems = data.problems || [];
        
        // Filter out solved problems
        const unsolvedProblems = allProblems.filter(problem => 
          !solvedProblemIds.includes(problem._id) && problem.isActive
        );
        
        if (unsolvedProblems.length > 0) {
          // Select random unsolved problem
          const randomIndex = Math.floor(Math.random() * unsolvedProblems.length);
          const challenge = unsolvedProblems[randomIndex];
          
          // Get difficulty-based XP
          const difficultyXP = {
            Easy: 50,
            Medium: 100,
            Hard: 200
          };
          
          setDailyChallenge({
            ...challenge,
            xpReward: difficultyXP[challenge.difficulty] || 50,
            solvedToday: challenge.acceptedSubmissions || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5001/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    if (userData) {
      fetchDashboardData();
    }
  }, [userData]);

  const resolvedCurrentStreak =
    dashboardData?.streakData?.currentStreak ??
    userData?.currentStreak ??
    userData?.streak ??
    0;

  // Dynamic stats based on real user data
  const stats = userData ? [
    { label: 'XP Points', value: userData.experience?.toString() || '0', icon: '⚡', color: 'text-yellow-400' },
    { label: 'Level', value: userData.level?.toString() || '1', icon: '🏆', color: 'text-purple-400' },
    { label: 'Streak', value: `${resolvedCurrentStreak} Days`, icon: '🔥', color: 'text-orange-400' },
    { label: 'Problems Solved', value: (userData.solvedProblems?.length || 0).toString(), icon: '✅', color: 'text-green-400' },
  ] : [
    { label: 'XP Points', value: '0', icon: '⚡', color: 'text-yellow-400' },
    { label: 'Level', value: '1', icon: '🏆', color: 'text-purple-400' },
    { label: 'Streak', value: '0 Days', icon: '🔥', color: 'text-orange-400' },
    { label: 'Problems Solved', value: '0', icon: '✅', color: 'text-green-400' },
  ];

  // Dynamic recent activity based on dashboard data
  const recentActivity = dashboardData?.recentActivity || (userData && userData.solvedProblems && userData.solvedProblems.length > 0 ? [
    // TODO: Fetch actual recent activity from API
    { type: 'Welcome', problem: 'Welcome to CodeArena!', difficulty: 'Getting Started', time: 'Just now', color: 'text-blue-400' },
  ] : [
    { type: 'Welcome', problem: 'Welcome to CodeArena!', difficulty: 'Getting Started', time: 'Just now', color: 'text-blue-400' },
    { type: 'Tip', problem: 'Start by solving easy problems', difficulty: 'Beginner', time: 'Ready to begin', color: 'text-green-400' },
    { type: 'Goal', problem: 'Complete your first problem', difficulty: 'Achievement', time: 'Next milestone', color: 'text-purple-400' },
  ]);

  const quickActions = [
    { label: 'Start Battle', icon: '⚔️', path: '/battle', color: 'bg-yellow-400 text-gray-950' },
    { label: 'Solve Problem', icon: '📚', path: '/problems', color: 'bg-gray-700 dark:bg-gray-700 text-white' },
    { label: 'Join Contest', icon: '🏆', path: '/contest', color: 'bg-gray-700 dark:bg-gray-700 text-white' },
    { label: 'Leaderboard', icon: '📊', path: '/leaderboard', color: 'bg-gray-700 dark:bg-gray-700 text-white' },
    { label: 'My Profile', icon: '👤', path: '/profile', color: 'bg-gray-700 dark:bg-gray-700 text-white' },
  ];

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

  const handleLogout = () => {
    localStorage.clear(); // Clear everything
    navigate('/');
  };

  // ✅ NEW: Go directly to the daily challenge problem
  const handleDailyChallengeSolve = () => {
    if (dailyChallenge?._id) {
      navigate(`/problem/${dailyChallenge._id}`);
    } else if (dailyChallenge?.id) {
      navigate(`/problem/${dailyChallenge.id}`);
    } else {
      navigate('/problems');
    }
  };

  // Show loading state while fetching user data
  if (loading || dashboardLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
              <button onClick={() => navigate('/problems')} className={`transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Problems</button>
              <button onClick={() => navigate('/battle')} className={`transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Battle</button>
              <button onClick={() => navigate('/contest')} className={`transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Contest</button>
              <button onClick={() => navigate('/leaderboard')} className={`transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Leaderboard</button>
            </div>

            {isAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition text-sm font-medium"
              >
                🔴 Admin
              </button>
            )}

            <ThemeToggle />
            <NotificationDropdown />
            
            <div className="relative group">
              <button 
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full bg-yellow-400 text-gray-950 font-bold flex items-center justify-center hover:bg-yellow-500 transition cursor-pointer"
              >
                {userName ? userName.charAt(0).toUpperCase() : 'A'}
              </button>
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
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl font-bold">Welcome back, <span className="text-yellow-400">{userName}</span> 👋</h2>
          <p className={`mt-1 transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ready to dominate today?</p>
        </motion.div>
        
        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className={`rounded-xl p-5 border transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className={`text-sm mt-1 transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Challenge */}
          <motion.div 
            variants={itemVariants}
            className={`lg:col-span-2 rounded-xl p-6 border transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
          >
            <h3 className="text-lg font-semibold mb-4">🎯 Daily Challenge</h3>
            {dailyChallenge ? (
              <div className={`rounded-lg p-4 mb-4 transition ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{dailyChallenge.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    dailyChallenge.difficulty === 'Easy' ? 'bg-green-400/10 text-green-400' :
                    dailyChallenge.difficulty === 'Medium' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-red-400/10 text-red-400'
                  }`}>
                    {dailyChallenge.difficulty}
                  </span>
                </div>
                <p className={`text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{dailyChallenge.description || 'Solve this problem to earn XP!'}</p>
                <div className={`flex items-center gap-4 mt-3 text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>🏷️ {dailyChallenge.category || 'General'}</span>
                  <span>⚡ +{dailyChallenge.xpReward} XP</span>
                  <span>👥 {dailyChallenge.solvedToday} solved today</span>
                </div>
              </div>
            ) : (
              <div className={`rounded-lg p-4 mb-4 transition ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading daily challenge...</p>
              </div>
            )}
            <motion.button 
              onClick={handleDailyChallengeSolve}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-3 rounded-lg transition"
            >
              Solve Now →
            </motion.button>
          </motion.div>
          
          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className={`rounded-xl p-6 border transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
          >
            <h3 className="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.button 
                  key={index} 
                  onClick={() => navigate(action.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full ${action.color} font-semibold py-3 px-4 rounded-lg transition hover:opacity-90 flex items-center gap-3`}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Daily Streak Section */}
        <motion.div variants={itemVariants} className="mt-6">
          <DailyStreak 
            userStreak={resolvedCurrentStreak} 
            goalDays={30} 
          />
        </motion.div>
        
        {/* Recent Activity */}
        <motion.div 
          variants={itemVariants}
          className={`mt-6 rounded-xl p-6 border transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
        >
          <h3 className="text-lg font-semibold mb-4">📋 Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div 
                key={index}
                whileHover={{ x: 5 }}
                className={`flex items-center justify-between py-3 border-b transition ${isDark ? 'border-gray-800' : 'border-gray-200'} last:border-0`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${activity.color}`}>{activity.type}</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{activity.problem}</span>
                  <span className={`text-xs px-2 py-1 rounded-full transition ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>{activity.difficulty}</span>
                </div>
                <span className={`text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Level Up Modal */}
      <LevelUpModal isOpen={showLevelUp} level={userLevel} onClose={() => setShowLevelUp(false)} />
    </div>
  );
}

export default Dashboard;