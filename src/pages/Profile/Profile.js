import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../components/NotificationDropdown';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Profile() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      return JSON.parse(currentUser);
    }
    return null;
  });

  const [editForm, setEditForm] = useState(user ? { ...user } : {});
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentBattles, setRecentBattles] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [recentActivityPage, setRecentActivityPage] = useState(1);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const departments = ['CSE', 'EEE', 'BBA', 'ENG', 'ME', 'CE'];
  const batches = ['2020', '2021', '2022', '2023', '2024'];

  const pageClass = isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900';
  const navClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const cardClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const softCardClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const tabWrapperClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const tabInactiveClass = isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  const inputClass = isDark
    ? 'w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition'
    : 'w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const subtleTextClass = isDark ? 'text-gray-500' : 'text-gray-500';
  const dividerClass = isDark ? 'border-gray-800' : 'border-gray-200';
  const secondaryButtonClass = isDark
    ? 'bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-4 py-2 rounded-lg transition';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : {};

        if (response.ok) {
          setUser(data.user || null);
          setEditForm(data.user || {});
          setRecentSubmissions(Array.isArray(data.recentSubmissions) ? data.recentSubmissions : []);
          setRecentBattles(Array.isArray(data.recentBattles) ? data.recentBattles : []);
          setHeatmapData(Array.isArray(data.heatmapData) ? data.heatmapData : []);
          setRatingHistory(Array.isArray(data.ratingHistory) ? data.ratingHistory : []);

          if (data.user) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
          }
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setEditForm({ ...user });
    }
  }, [user, isEditing]);

  useEffect(() => {
    setRecentActivityPage(1);
  }, [recentSubmissions, recentBattles]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 320;
          const maxHeight = 320;

          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', 0.72);
          resolve(compressed);
        };

        img.onerror = reject;
        img.src = reader.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSave = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    if (
      !editForm.firstName?.trim() ||
      !editForm.lastName?.trim() ||
      !editForm.username?.trim() ||
      !editForm.email?.trim()
    ) {
      setSaveMessage('First name, last name, username, and email are required');
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage('');

      const payload = {
        firstName: editForm.firstName || '',
        lastName: editForm.lastName || '',
        username: editForm.username || '',
        email: editForm.email || '',
        phone: editForm.phone || '',
        department: editForm.department || '',
        batch: editForm.batch || '',
        bio: editForm.bio || '',
        github: editForm.github || '',
        linkedin: editForm.linkedin || '',
        photoUrl: editForm.photoUrl || ''
      };

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : {};

      if (!response.ok) {
        setSaveMessage(data.message || 'Failed to update profile');
        return;
      }

      setUser(data.user || null);
      setEditForm(data.user || {});
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setIsEditing(false);
      setSaveMessage(data.message || 'Profile updated successfully');

      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(user ? { ...user } : {});
    setIsEditing(false);
    setSaveMessage('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setSaveMessage('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);

    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || user?.username || 'User';
  };

  const getAvatarChar = () => {
    const name = getUserName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getProfileImage = (profileUser) => {
    return profileUser?.photoUrl || profileUser?.avatar || '';
  };

  const getSafeUrl = (value) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    return `https://${value}`;
  };

  const getJoinedText = () => {
    if (!user?.createdAt) return 'Recently';
    const joinedDate = new Date(user.createdAt);
    if (Number.isNaN(joinedDate.getTime())) return 'Recently';
    return joinedDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateValue) => {
    if (!dateValue) return 'Recently';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Recently';

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const difficultyStats = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0, Other: 0 };

    recentSubmissions.forEach((submission) => {
      const difficulty = String(submission.difficulty || '').trim();
      if (difficulty === 'Easy' || difficulty === 'Medium' || difficulty === 'Hard') {
        counts[difficulty] += 1;
      } else {
        counts.Other += 1;
      }
    });

    const maxCount = Math.max(1, counts.Easy, counts.Medium, counts.Hard, counts.Other);

    return [
      { label: 'Easy', count: counts.Easy, width: (counts.Easy / maxCount) * 100, color: 'bg-green-400' },
      { label: 'Medium', count: counts.Medium, width: (counts.Medium / maxCount) * 100, color: 'bg-yellow-400' },
      { label: 'Hard', count: counts.Hard, width: (counts.Hard / maxCount) * 100, color: 'bg-red-400' },
      { label: 'Other', count: counts.Other, width: (counts.Other / maxCount) * 100, color: 'bg-blue-400' }
    ];
  }, [recentSubmissions]);

  const heatmapCells = useMemo(() => {
    const countMap = new Map();

    heatmapData.forEach((item) => {
      if (!item?.date) return;
      countMap.set(item.date, Number(item.count) || 0);
    });

    const totalDays = 168;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells = [];
    for (let i = totalDays - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const key = date.toISOString().slice(0, 10);
      cells.push({
        date: key,
        count: countMap.get(key) || 0
      });
    }

    return cells;
  }, [heatmapData]);

  const heatmapWeeks = useMemo(() => {
    const weeks = [];
    let currentWeek = new Array(7).fill(null);

    heatmapCells.forEach((cell, index) => {
      const dayIndex = new Date(cell.date).getDay();
      currentWeek[dayIndex] = cell;

      const isEndOfWeek = dayIndex === 6;
      const isLastCell = index === heatmapCells.length - 1;

      if (isEndOfWeek || isLastCell) {
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }
    });

    return weeks;
  }, [heatmapCells]);

  const monthLabels = useMemo(() => {
    let lastMonth = '';

    return heatmapWeeks.map((week) => {
      const firstFilledCell = week.find(Boolean);
      if (!firstFilledCell) return '';

      const month = new Date(firstFilledCell.date).toLocaleDateString('en-US', {
        month: 'short'
      });

      if (month === lastMonth) return '';

      lastMonth = month;
      return month;
    });
  }, [heatmapWeeks]);

  const heatmapStats = useMemo(() => {
    const activeCells = heatmapCells.filter((cell) => cell.count > 0);
    const totalContributions = heatmapCells.reduce((sum, cell) => sum + cell.count, 0);
    const activeDays = activeCells.length;
    const bestDay = activeCells.reduce((max, cell) => Math.max(max, cell.count), 0);

    let longestStreak = 0;
    let runningStreak = 0;

    heatmapCells.forEach((cell) => {
      if (cell.count > 0) {
        runningStreak += 1;
        longestStreak = Math.max(longestStreak, runningStreak);
      } else {
        runningStreak = 0;
      }
    });

    let currentStreak = 0;
    for (let i = heatmapCells.length - 1; i >= 0; i -= 1) {
      if (heatmapCells[i].count > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    return {
      totalContributions,
      activeDays,
      bestDay,
      longestStreak,
      currentStreak
    };
  }, [heatmapCells]);

  const heatmapMaxCount = useMemo(() => {
    return Math.max(1, ...heatmapCells.map((cell) => cell.count || 0));
  }, [heatmapCells]);

  const heatmapRangeText = useMemo(() => {
    if (heatmapCells.length === 0) return 'Last 24 weeks';

    const start = new Date(heatmapCells[0].date);
    const end = new Date(heatmapCells[heatmapCells.length - 1].date);

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }, [heatmapCells]);

  const getHeatmapLevel = (count) => {
    if (count <= 0) return 0;

    const ratio = count / heatmapMaxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const getHeatmapCellClass = (count) => {
    const level = getHeatmapLevel(count);

    if (level === 0) {
      return isDark
        ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
        : 'bg-gray-100 border border-gray-200 hover:bg-gray-200';
    }

    if (level === 1) {
      return isDark
        ? 'bg-green-900 border border-green-800 hover:bg-green-800'
        : 'bg-green-200 border border-green-300 hover:bg-green-300';
    }

    if (level === 2) {
      return isDark
        ? 'bg-green-700 border border-green-600 hover:bg-green-600'
        : 'bg-green-300 border border-green-400 hover:bg-green-400';
    }

    if (level === 3) {
      return isDark
        ? 'bg-green-600 border border-green-500 hover:bg-green-500'
        : 'bg-green-400 border border-green-500 hover:bg-green-500';
    }

    return isDark
      ? 'bg-green-400 border border-green-300 hover:bg-green-300'
      : 'bg-green-500 border border-green-600 hover:bg-green-600';
  };

  const getVerdictClass = (verdict) => {
    const normalized = String(verdict || '').toLowerCase();
    if (normalized === 'accepted') return 'text-green-400';
    if (normalized === 'wrong answer') return 'text-red-400';
    if (normalized === 'time limit exceeded') return 'text-yellow-400';
    return isDark ? 'text-gray-300' : 'text-gray-700';
  };

  const recentActivity = useMemo(() => {
    const submissionActivities = recentSubmissions.map((submission) => ({
      id: `submission-${submission.id}`,
      type: String(submission.verdict || '').toLowerCase() === 'accepted' ? 'solved' : 'submission',
      title: submission.problem,
      difficulty: submission.difficulty || '',
      time: formatRelativeTime(submission.createdAt),
      xp: String(submission.verdict || '').toLowerCase() === 'accepted' ? 10 : 0,
      sortDate: submission.createdAt || new Date().toISOString()
    }));

    const battleActivities = recentBattles.map((battle) => ({
      id: `battle-${battle.id}`,
      type:
        String(battle.result || '').toLowerCase() === 'won'
          ? 'battle_won'
          : String(battle.result || '').toLowerCase() === 'lost'
            ? 'battle_lost'
            : 'battle_other',
      opponent: battle.opponent,
      time: formatRelativeTime(battle.createdAt),
      xp: String(battle.result || '').toLowerCase() === 'won' ? 15 : 0,
      sortDate: battle.createdAt || new Date().toISOString()
    }));

    return [...submissionActivities, ...battleActivities]
      .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
  }, [recentSubmissions, recentBattles]);

  const recentActivityPerPage = 5;
  const totalRecentActivityPages = Math.max(1, Math.ceil(recentActivity.length / recentActivityPerPage));
  const paginatedRecentActivity = recentActivity.slice(
    (recentActivityPage - 1) * recentActivityPerPage,
    recentActivityPage * recentActivityPerPage
  );

  const ratingChartData = useMemo(() => {
    if (!Array.isArray(ratingHistory) || ratingHistory.length === 0) {
      return [{ rating: user?.rating || 1200, date: new Date(), reason: 'Current Rating' }];
    }

    return ratingHistory.map((item) => ({
      rating: Number(item.rating) || 0,
      date: item.date,
      reason: item.reason || 'Rating Update'
    }));
  }, [ratingHistory, user]);

  const ratingChart = useMemo(() => {
    const points = ratingChartData;
    const width = 100;
    const height = 36;
    const paddingX = 6;
    const paddingY = 4;

    const ratings = points.map((item) => item.rating);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    const range = Math.max(1, maxRating - minRating);

    const pathPoints = points.map((point, index) => {
      const x = paddingX + (index * (width - paddingX * 2)) / Math.max(points.length - 1, 1);
      const y = height - paddingY - ((point.rating - minRating) / range) * (height - paddingY * 2);
      return { x, y, ...point };
    });

    const path = pathPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

    return {
      width,
      height,
      minRating,
      maxRating,
      pathPoints,
      path
    };
  }, [ratingChartData]);

  const currentRating = user?.rating || 1200;
  const highestRating = user?.highestRating || currentRating;

  const milestoneCards = [
    { label: 'Problems Solved', value: user?.solvedProblems?.length || 0, color: 'text-green-400' },
    { label: 'Total Submissions', value: user?.totalSubmissions || 0, color: 'text-blue-400' },
    { label: 'Contests Joined', value: user?.contestsParticipated?.length || 0, color: 'text-purple-400' },
    { label: 'Battles Won', value: user?.battlesWon || 0, color: 'text-yellow-400' },
    { label: 'Current Streak', value: user?.currentStreak || user?.streak || 0, color: 'text-orange-400' },
    { label: 'Highest Rating', value: highestRating, color: 'text-pink-400' }
  ];

  const getActivityIcon = (type) => {
    const icons = {
      solved: '✅',
      battle_won: '⚔️',
      battle_lost: '💀',
      battle_other: '🛡️',
      submission: '📝'
    };
    return icons[type] || '📝';
  };

  const getActivityColor = (type) => {
    const colors = {
      solved: 'text-green-400',
      battle_won: 'text-yellow-400',
      battle_lost: 'text-red-400',
      battle_other: 'text-blue-400',
      submission: isDark ? 'text-gray-300' : 'text-gray-700'
    };
    return colors[type] || (isDark ? 'text-gray-300' : 'text-gray-700');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${pageClass}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className={mutedTextClass}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${pageClass}`}>
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading profile. Please try logging in again.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-medium px-6 py-2 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageClass}`}>
      <nav className={`border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${navClass}`}>
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
          Code<span className="text-yellow-400">Arena</span>
        </h1>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className={`transition-colors ${mutedTextClass} hover:text-yellow-400`}>Dashboard</button>
          <button onClick={() => navigate('/problems')} className={`transition-colors ${mutedTextClass} hover:text-yellow-400`}>Problems</button>
          <button onClick={() => navigate('/battle')} className={`transition-colors ${mutedTextClass} hover:text-yellow-400`}>Battle</button>
          <button onClick={() => navigate('/leaderboard')} className={`transition-colors ${mutedTextClass} hover:text-yellow-400`}>Leaderboard</button>

          <ThemeToggle />
          <NotificationDropdown />

          <div className="relative group">
            <button className="w-9 h-9 rounded-full bg-yellow-400 text-gray-950 font-bold flex items-center justify-center">
              {getAvatarChar()}
            </button>

            <div className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${cardClass}`}>
              <div className="py-2">
                <button
                  onClick={() => navigate('/profile')}
                  className={`w-full text-left px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  👤 Profile
                </button>

                <button
                  onClick={() => setIsEditing(true)}
                  className={`w-full text-left px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  ✏️ Edit Profile
                </button>

                <hr className={`my-2 ${dividerClass}`} />

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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {saveMessage && (
          <div className="mb-4 bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{saveMessage}</span>
            <button onClick={() => setSaveMessage('')} className="text-green-400 hover:text-green-300">✕</button>
          </div>
        )}

        <div className={`border rounded-2xl p-8 mb-6 ${cardClass}`}>
          {!isEditing ? (
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl font-bold text-gray-950 overflow-hidden">
                    {getProfileImage(user) ? (
                      <img src={getProfileImage(user)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getAvatarChar()
                    )}
                  </div>

                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-lg border-4 ${isDark ? 'border-gray-900' : 'border-white'}`}>
                    🟢
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-1">{getUserName()}</h2>
                  <p className={`${mutedTextClass} mb-2`}>@{user.username || 'user'}</p>

                  <div className={`flex items-center gap-3 text-sm mb-3 flex-wrap ${mutedTextClass}`}>
                    <span className={`${softCardClass} px-3 py-1 rounded-full`}>
                      {user.department || 'N/A'} • {user.batch || 'N/A'}
                    </span>
                    <span className="bg-yellow-400/10 text-yellow-500 px-3 py-1 rounded-full font-medium">
                      Level {user.level || 1}
                    </span>
                    <span>Joined {getJoinedText()}</span>
                  </div>

                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-xl mb-3`}>
                    {user.bio || 'No bio added yet'}
                  </p>

                  <div className={`flex flex-wrap gap-4 text-sm ${mutedTextClass}`}>
                    {user.github && (
                      <a
                        href={getSafeUrl(user.github)}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-yellow-400 transition flex items-center gap-1"
                      >
                        🔗 GitHub
                      </a>
                    )}

                    {user.linkedin && (
                      <a
                        href={getSafeUrl(user.linkedin)}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-yellow-400 transition flex items-center gap-1"
                      >
                        🔗 LinkedIn
                      </a>
                    )}

                    {user.phone && (
                      <span className="flex items-center gap-1">
                        📞 {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={() => setIsEditing(true)} className={secondaryButtonClass}>
                ✏️ Edit Profile
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Profile</h2>

                <div className="flex gap-2">
                  <button onClick={handleCancel} className={secondaryButtonClass}>
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 mb-4 md:col-span-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-gray-950 overflow-hidden">
                    {getProfileImage(editForm) ? (
                      <img src={getProfileImage(editForm)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getAvatarChar()
                    )}
                  </div>

                  <div className="flex-1">
                    <p className={`text-sm ${mutedTextClass}`}>Profile Picture</p>

                    <label className="inline-block mt-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.size > 5 * 1024 * 1024) {
                            setSaveMessage('File size must be less than 5MB');
                            return;
                          }

                          try {
                            const compressedImage = await compressImage(file);
                            setEditForm((prev) => ({ ...prev, photoUrl: compressedImage }));
                            setSaveMessage(`Photo selected: ${file.name}`);
                          } catch (error) {
                            console.error('Image compression failed:', error);
                            setSaveMessage('Failed to process image');
                          }
                        }}
                      />
                      <span className={`text-xs px-3 py-1.5 rounded inline-block transition ${isDark ? 'text-gray-300 bg-gray-800 hover:bg-gray-700' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}>
                        📸 Upload Photo
                      </span>
                    </label>

                    <p className={`text-xs mt-1 ${subtleTextClass}`}>JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName || ''}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="Your first name"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName || ''}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="Your last name"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username || ''}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="Unique username"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email || ''}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="you@university.edu"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone || ''}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="+880 1234-567890"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>Department</label>
                  <select
                    name="department"
                    value={editForm.department || ''}
                    onChange={handleEditChange}
                    className={inputClass}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>Batch</label>
                  <select
                    name="batch"
                    value={editForm.batch || ''}
                    onChange={handleEditChange}
                    className={inputClass}
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>GitHub Profile</label>
                  <input
                    type="text"
                    name="github"
                    value={editForm.github || ''}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="github.com/username"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>LinkedIn Profile</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={editForm.linkedin || ''}
                    onChange={handleEditChange}
                    className={inputClass}
                    placeholder="linkedin.com/in/username"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm mb-2 ${mutedTextClass}`}>Bio</label>
                  <textarea
                    name="bio"
                    value={editForm.bio || ''}
                    onChange={handleEditChange}
                    rows={3}
                    maxLength={200}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us about yourself..."
                  />
                  <p className={`text-xs mt-1 ${subtleTextClass}`}>{editForm.bio?.length || 0}/200 characters</p>
                </div>

                <div className={`md:col-span-2 border-t pt-6 mt-6 ${dividerClass}`}>
                  {!showPasswordForm ? (
                    <button
                      onClick={() => {
                        setShowPasswordForm(true);
                        setPasswordError('');
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      🔐 Change Password
                    </button>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Change Password</h3>

                      {passwordError && (
                        <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                          {passwordError}
                        </div>
                      )}

                      <div className="mb-4">
                        <label className={`block text-sm mb-2 ${mutedTextClass}`}>Current Password *</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className={inputClass}
                          placeholder="Enter your current password"
                        />
                      </div>

                      <div className="mb-4">
                        <label className={`block text-sm mb-2 ${mutedTextClass}`}>New Password *</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className={inputClass}
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>

                      <div className="mb-6">
                        <label className={`block text-sm mb-2 ${mutedTextClass}`}>Confirm Password *</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className={inputClass}
                          placeholder="Confirm your new password"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setPasswordError('');
                          }}
                          className={secondaryButtonClass}
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleChangePassword}
                          className="bg-green-500 hover:bg-green-400 text-white font-medium px-4 py-2 rounded-lg transition"
                        >
                          ✓ Update Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t ${dividerClass}`}>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{(user.experience || 0).toLocaleString()}</div>
                <div className={`${mutedTextClass} text-sm`}>Total XP</div>
                <div className={`w-full h-2 rounded-full mt-2 overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div
                    className="bg-yellow-400 h-full rounded-full"
                    style={{ width: `${Math.min(((user.experience || 0) / 1000) * 100, 100)}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 ${subtleTextClass}`}>{user.experience || 0}/1000 to next level</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{currentRating}</div>
                <div className={`${mutedTextClass} text-sm`}>Current Rating</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">{highestRating}</div>
                <div className={`${mutedTextClass} text-sm`}>Highest Rating</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{user.solvedProblems?.length || 0}</div>
                <div className={`${mutedTextClass} text-sm`}>Problems Solved</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{user.totalSubmissions || 0}</div>
                <div className={`${mutedTextClass} text-sm`}>Total Submissions</div>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <>
            <div className={`flex gap-1 mb-6 p-1 rounded-xl border ${tabWrapperClass}`}>
              {[
                { id: 'overview', label: '📊 Overview' },
                { id: 'achievements', label: '🏅 Achievements' },
                { id: 'submissions', label: '📝 Submissions' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-yellow-400 text-gray-950'
                      : tabInactiveClass
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`border rounded-xl p-6 ${cardClass}`}>
                    <h3 className="text-lg font-semibold mb-4">📚 Submission Difficulty Breakdown</h3>

                    <div className="space-y-4">
                      {difficultyStats.map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={mutedTextClass}>{item.label}</span>
                            <span className="font-medium">{item.count}</span>
                          </div>
                          <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${item.width}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`border rounded-xl p-6 ${cardClass}`}>
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <h3 className="text-lg font-semibold">🔥 Submission Heatmap</h3>
                        <p className={`text-sm mt-1 ${mutedTextClass}`}>
                          Real submission activity synced from your database
                        </p>
                      </div>

                      <div className={`text-right text-sm ${mutedTextClass}`}>
                        <div>{heatmapRangeText}</div>
                        <div className="text-yellow-400 font-medium mt-1">
                          {heatmapStats.totalContributions} total submissions
                        </div>
                      </div>
                    </div>

                    {heatmapWeeks.length > 0 ? (
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className={`rounded-xl border p-4 ${softCardClass}`}>
                            <div className={`text-xs uppercase tracking-wide ${subtleTextClass}`}>Active Days</div>
                            <div className="text-2xl font-bold text-green-400 mt-1">{heatmapStats.activeDays}</div>
                          </div>

                          <div className={`rounded-xl border p-4 ${softCardClass}`}>
                            <div className={`text-xs uppercase tracking-wide ${subtleTextClass}`}>Best Day</div>
                            <div className="text-2xl font-bold text-yellow-400 mt-1">{heatmapStats.bestDay}</div>
                          </div>

                          <div className={`rounded-xl border p-4 ${softCardClass}`}>
                            <div className={`text-xs uppercase tracking-wide ${subtleTextClass}`}>Longest Streak</div>
                            <div className="text-2xl font-bold text-blue-400 mt-1">{heatmapStats.longestStreak}</div>
                          </div>

                          <div className={`rounded-xl border p-4 ${softCardClass}`}>
                            <div className={`text-xs uppercase tracking-wide ${subtleTextClass}`}>Current Streak</div>
                            <div className="text-2xl font-bold text-orange-400 mt-1">{heatmapStats.currentStreak}</div>
                          </div>
                        </div>

                        <div className={`rounded-2xl border p-4 overflow-x-auto ${softCardClass}`}>
                          <div className="min-w-max">
                            <div className="flex gap-1 ml-10 mb-3 text-[11px] text-gray-500">
                              {monthLabels.map((label, index) => (
                                <div key={`${label}-${index}`} className="w-4 text-center">
                                  {label}
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-3">
                              <div className={`grid grid-rows-7 gap-1 text-[11px] ${subtleTextClass} pt-0.5`}>
                                <div>Sun</div>
                                <div></div>
                                <div>Tue</div>
                                <div></div>
                                <div>Thu</div>
                                <div></div>
                                <div>Sat</div>
                              </div>

                              <div className="flex gap-1">
                                {heatmapWeeks.map((week, weekIndex) => (
                                  <div key={weekIndex} className="grid grid-rows-7 gap-1">
                                    {week.map((cell, dayIndex) => (
                                      <div
                                        key={cell ? cell.date : `empty-${weekIndex}-${dayIndex}`}
                                        title={
                                          cell
                                            ? `${cell.date}: ${cell.count} submission${cell.count !== 1 ? 's' : ''}`
                                            : ''
                                        }
                                        className={`w-4 h-4 rounded-[4px] transition-all duration-200 ${
                                          cell
                                            ? `${getHeatmapCellClass(cell.count)} hover:scale-110 hover:shadow-md`
                                            : 'bg-transparent'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <span className={`text-sm ${mutedTextClass}`}>
                            Darker / brighter cells mean more submissions on that day
                          </span>

                          <div className={`flex items-center gap-2 text-sm ${mutedTextClass}`}>
                            <span>Less</span>
                            <span className={`w-4 h-4 rounded-[4px] ${getHeatmapCellClass(0)}`}></span>
                            <span className={`w-4 h-4 rounded-[4px] ${getHeatmapCellClass(Math.max(1, Math.ceil(heatmapMaxCount * 0.25)))}`}></span>
                            <span className={`w-4 h-4 rounded-[4px] ${getHeatmapCellClass(Math.max(1, Math.ceil(heatmapMaxCount * 0.5)))}`}></span>
                            <span className={`w-4 h-4 rounded-[4px] ${getHeatmapCellClass(Math.max(1, Math.ceil(heatmapMaxCount * 0.75)))}`}></span>
                            <span className={`w-4 h-4 rounded-[4px] ${getHeatmapCellClass(heatmapMaxCount)}`}></span>
                            <span>More</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className={mutedTextClass}>No submission heatmap data found yet.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`border rounded-xl p-6 ${cardClass}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">📈 Rating Progress</h3>
                      <span className={`text-sm ${mutedTextClass}`}>Current: {currentRating}</span>
                    </div>

                    <div className={`rounded-xl border p-4 ${softCardClass}`}>
                      <svg viewBox={`0 0 ${ratingChart.width} ${ratingChart.height}`} className="w-full h-48">
                        <path
                          d={ratingChart.path}
                          fill="none"
                          stroke="rgb(250 204 21)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {ratingChart.pathPoints.map((point, index) => (
                          <circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="1.7"
                            fill="rgb(250 204 21)"
                          />
                        ))}
                      </svg>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className={mutedTextClass}>Lowest</div>
                          <div className="font-semibold">{ratingChart.minRating}</div>
                        </div>
                        <div>
                          <div className={mutedTextClass}>Highest</div>
                          <div className="font-semibold">{ratingChart.maxRating}</div>
                        </div>
                      </div>

                      <div className={`mt-4 max-h-36 overflow-y-auto pr-1 space-y-2 text-sm ${mutedTextClass}`}>
                        {ratingChartData.slice().reverse().map((item, index) => (
                          <div key={`${item.rating}-${index}`} className={`flex items-center justify-between border-b pb-2 last:border-0 ${dividerClass}`}>
                            <span>{item.reason || 'Rating Update'}</span>
                            <span className="font-medium text-yellow-500">{item.rating}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`border rounded-xl p-6 ${cardClass}`}>
                    <h3 className="text-lg font-semibold mb-4">📋 Recent Activity</h3>

                    <div className="space-y-3">
                      {paginatedRecentActivity.length > 0 ? (
                        paginatedRecentActivity.map((activity) => (
                          <div key={activity.id} className={`flex items-center justify-between py-3 border-b last:border-0 ${dividerClass}`}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{getActivityIcon(activity.type)}</span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`font-medium ${getActivityColor(activity.type)}`}>
                                    {activity.type === 'solved' && `Solved ${activity.title}`}
                                    {activity.type === 'submission' && `Submitted ${activity.title}`}
                                    {activity.type === 'battle_won' && `Won against ${activity.opponent}`}
                                    {activity.type === 'battle_lost' && `Lost to ${activity.opponent}`}
                                    {activity.type === 'battle_other' && `Battle update against ${activity.opponent}`}
                                  </span>

                                  {activity.difficulty && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      activity.difficulty === 'Easy'
                                        ? 'bg-green-400/10 text-green-400'
                                        : activity.difficulty === 'Medium'
                                          ? 'bg-yellow-400/10 text-yellow-400'
                                          : 'bg-red-400/10 text-red-400'
                                    }`}>
                                      {activity.difficulty}
                                    </span>
                                  )}
                                </div>

                                <div className={`text-sm ${subtleTextClass}`}>{activity.time}</div>
                              </div>
                            </div>

                            <span className={`font-medium ${activity.xp > 0 ? 'text-green-400' : mutedTextClass}`}>
                              {activity.xp > 0 ? '+' : ''}{activity.xp} XP
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className={mutedTextClass}>No recent activity found yet.</p>
                      )}
                    </div>

                    {recentActivity.length > recentActivityPerPage && (
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={() => setRecentActivityPage((prev) => Math.max(prev - 1, 1))}
                          disabled={recentActivityPage === 1}
                          className={`${secondaryButtonClass} disabled:opacity-50`}
                        >
                          Previous
                        </button>

                        <span className={`text-sm ${mutedTextClass}`}>
                          Page {recentActivityPage} of {totalRecentActivityPages}
                        </span>

                        <button
                          onClick={() => setRecentActivityPage((prev) => Math.min(prev + 1, totalRecentActivityPages))}
                          disabled={recentActivityPage === totalRecentActivityPages}
                          className={`${secondaryButtonClass} disabled:opacity-50`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className={`border rounded-xl p-6 ${cardClass}`}>
                <h3 className="text-lg font-semibold mb-6">🏅 Profile Milestones</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {milestoneCards.map((item) => (
                    <div key={item.label} className={`border rounded-xl p-5 ${softCardClass}`}>
                      <div className={`text-3xl font-bold mb-2 ${item.color}`}>{item.value}</div>
                      <div className={mutedTextClass}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className={`border rounded-xl p-6 ${cardClass}`}>
                <h3 className="text-lg font-semibold mb-4">📝 Recent Submissions</h3>

                <div className="space-y-2">
                  {recentSubmissions.length > 0 ? (
                    recentSubmissions.map((sub) => (
                      <div key={sub.id} className={`flex items-center justify-between py-3 border-b last:border-0 ${dividerClass}`}>
                        <div>
                          <div className="font-medium">{sub.problem}</div>
                          <div className={`text-sm ${subtleTextClass}`}>
                            {sub.language} • {formatRelativeTime(sub.createdAt)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-medium ${getVerdictClass(sub.verdict)}`}>
                            {sub.verdict}
                          </div>
                          <div className={`text-sm ${subtleTextClass}`}>{sub.runtime || '-'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={mutedTextClass}>No submission data found yet.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;