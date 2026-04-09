import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SkillRadar from '../../components/SkillRadar';
import Heatmap from '../../components/Heatmap';
import BattleStats from '../../components/BattleStats';
import RatingGraph from '../../components/RatingGraph';
import AchievementWall from '../../components/AchievementWall';
import NotificationDropdown from '../../components/NotificationDropdown';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Profile() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // User data state (load from localStorage - which contains API data)
  const [user, setUser] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      return JSON.parse(currentUser);
    }
    return null;
  });

  // Fetch fresh user data from API on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
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
          setUser(data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  // Edit form state - declare this BEFORE password handlers that use it
  const [editForm, setEditForm] = useState(user ? { ...user } : {});

  // Update edit form when user changes
  useEffect(() => {
    if (user) {
      setEditForm({ ...user });
    }
  }, [user, isEditing]);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);


  const skillData = [
    // Dynamically generated based on solved problems
    // For now, empty until we fetch real data
  ];

  const recentActivity = [
    // Will be populated from API when submissions endpoint is ready
    // For now, empty
  ];

  const departments = ['CSE', 'EEE', 'BBA', 'ENG', 'ME', 'CE'];
  const batches = ['2020', '2021', '2022', '2023', '2024'];

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    // Simulate API call
    setTimeout(() => {
      const updatedUser = { ...editForm };
      setUser(updatedUser);
      // Save to both userProfile and currentUser to ensure persistence
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setIsSaving(false);
      setIsEditing(false);
      setSaveMessage('Profile updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    setEditForm(user ? { ...user } : {});
    setIsEditing(false);
    setSaveMessage('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    // Validation
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

    // Update password via API (when endpoint is ready)
    // For now, show success message
    // TODO: Implement API endpoint for password change
    // const response = await fetch('http://localhost:5001/api/auth/change-password', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    //   body: JSON.stringify({
    //     currentPassword: passwordForm.currentPassword,
    //     newPassword: passwordForm.newPassword
    //   })
    // });

    setSaveMessage('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);

    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    navigate('/');
  };

  // Helper function to get user's full name
  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || user?.username || 'User';
  };

  // Helper function to get first character for avatar
  const getAvatarChar = () => {
    const name = getUserName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
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

  const getActivityIcon = (type) => {
    const icons = {
      solved: '✅',
      battle_won: '⚔️',
      battle_lost: '💀',
      badge: '🏅',
    };
    return icons[type] || '📝';
  };

  const getActivityColor = (type) => {
    const colors = {
      solved: 'text-green-400',
      battle_won: 'text-yellow-400',
      battle_lost: 'text-red-400',
      badge: 'text-purple-400',
    };
    return colors[type] || 'text-gray-400';
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
            <button className="w-9 h-9 rounded-full bg-yellow-400 text-gray-950 font-bold flex items-center justify-center">
              {getAvatarChar()}
            </button>
            <div className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Success Message */}
        {saveMessage && (
          <div className="mb-4 bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{saveMessage}</span>
            <button onClick={() => setSaveMessage('')} className="text-green-400 hover:text-green-300">✕</button>
          </div>
        )}

        {/* Profile Header / Edit Form */}
        <div className={`border rounded-2xl p-8 mb-6 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          {!isEditing ? (
            // View Mode
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl font-bold text-gray-950 overflow-hidden">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getAvatarChar()
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-lg border-4 border-gray-900">
                    🟢
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">{getUserName()}</h2>
                  <p className="text-gray-400 mb-2">@{user.username || 'user'}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-3 flex-wrap">
                    <span className="bg-gray-800 px-3 py-1 rounded-full">{user.department || 'N/A'} • {user.batch || 'N/A'}</span>
                    <span className="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full font-medium">Level {user.level || 1}</span>
                    <span>Joined {user.joined || 'Recently'}</span>
                  </div>
                  <p className="text-gray-300 max-w-xl mb-3">{user.bio || 'No bio added yet'}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {user.github && (
                      <a href={`https://${user.github}`} className="text-gray-400 hover:text-white transition flex items-center gap-1">
                        🔗 GitHub
                      </a>
                    )}
                    {user.linkedin && (
                      <a href={`https://${user.linkedin}`} className="text-gray-400 hover:text-white transition flex items-center gap-1">
                        🔗 LinkedIn
                      </a>
                    )}
                    {user.phone && (
                      <span className="text-gray-400 flex items-center gap-1">
                        📞 {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                ✏️ Edit Profile
              </button>
            </div>
          ) : (
            // Edit Mode
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancel}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition"
                  >
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
                {/* Avatar Preview & Upload */}
                <div className="flex items-center gap-4 mb-4 md:col-span-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-gray-950 overflow-hidden">
                    {editForm.photoUrl ? (
                      <img src={editForm.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getAvatarChar()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Profile Picture</p>
                    <label className="inline-block mt-2 cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setSaveMessage('File size must be less than 5MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditForm({ ...editForm, photoUrl: reader.result });
                              setSaveMessage('Photo selected: ' + file.name);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <span className="text-xs text-gray-400 px-3 py-1.5 bg-gray-800 rounded hover:bg-gray-700 inline-block transition">📸 Upload Photo</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName || ''}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                    placeholder="Your first name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName || ''}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                    placeholder="Your last name"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                    placeholder="Unique username"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                    placeholder="you@university.edu"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone || ''}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                    placeholder="+880 1234-567890"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Department *</label>
                  <select
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Batch *</label>
                  <select
                    name="batch"
                    value={editForm.batch}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                  >
                    {batches.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>

                {/* GitHub */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">GitHub Profile</label>
                  <input
                    type="text"
                    name="github"
                    value={editForm.github}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                    placeholder="github.com/username"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">LinkedIn Profile</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={editForm.linkedin}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                    placeholder="linkedin.com/in/username"
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{editForm.bio?.length || 0}/200 characters</p>
                </div>

                {/* Change Password Section */}
                <div className="md:col-span-2 border-t border-gray-800 pt-6 mt-6">
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
                      <h3 className="text-lg font-semibold mb-4 text-white">Change Password</h3>
                      
                      {passwordError && (
                        <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                          {passwordError}
                        </div>
                      )}

                      {/* Current Password */}
                      <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">Current Password *</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                          placeholder="Enter your current password"
                        />
                      </div>

                      {/* New Password */}
                      <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">New Password *</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>

                      {/* Confirm Password */}
                      <div className="mb-6">
                        <label className="block text-sm text-gray-400 mb-2">Confirm Password *</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                          placeholder="Confirm your new password"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setPasswordError('');
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition"
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

          {/* Stats Row - Only show in view mode */}
          {!isEditing && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{(user.experience || 0).toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Total XP</div>
                <div className="w-full bg-gray-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-yellow-400 h-full rounded-full"
                    style={{ width: `${((user.experience || 0) / 1000) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{(user.experience || 0)}/1000 to next level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">#{user.rank || 'N/A'}</div>
                <div className="text-gray-400 text-sm">Global Rank</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{(user.solvedProblems?.length || 0)}</div>
                <div className="text-gray-400 text-sm">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{user.battlesWon || 0}W</div>
                <div className="text-gray-400 text-sm">Battles Won</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs - Hide in edit mode */}
        {!isEditing && (
          <>
            <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl border border-gray-800">
              {[
                { id: 'overview', label: '📊 Overview' },
                { id: 'achievements', label: '🏅 Achievements' },
                { id: 'submissions', label: '📝 Submissions' },
                { id: 'battles', label: '⚔️ Battles' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-yellow-400 text-gray-950'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      🎯 Skill Distribution
                    </h3>
                    <SkillRadar data={skillData} />
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      🔥 Submission Heatmap
                    </h3>
                    <Heatmap />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      📈 Rating Progress
                    </h3>
                    <RatingGraph />
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      ⚔️ Battle Performance
                    </h3>
                    <BattleStats />
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">📋 Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getActivityIcon(activity.type)}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${getActivityColor(activity.type)}`}>
                                {activity.type === 'solved' && `Solved ${activity.title}`}
                                {activity.type === 'battle_won' && `Won against ${activity.opponent}`}
                                {activity.type === 'battle_lost' && `Lost to ${activity.opponent}`}
                                {activity.type === 'badge' && `Earned ${activity.name}`}
                              </span>
                              {activity.difficulty && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  activity.difficulty === 'Easy' ? 'bg-green-400/10 text-green-400' :
                                  activity.difficulty === 'Medium' ? 'bg-yellow-400/10 text-yellow-400' :
                                  'bg-red-400/10 text-red-400'
                                }`}>
                                  {activity.difficulty}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-500 text-sm">{activity.time}</div>
                          </div>
                        </div>
                        {activity.xp && (
                          <span className={`font-medium ${activity.xp > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {activity.xp > 0 ? '+' : ''}{activity.xp} XP
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">🏅 Achievement Wall</h3>
                  <div className="text-sm text-gray-400">
                    Unlocked: <span className="text-yellow-400 font-bold">5/8</span>
                  </div>
                </div>
                <AchievementWall />
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">📝 Recent Submissions</h3>
                <div className="space-y-2">
                  {[
                    { problem: 'Two Sum', verdict: 'Accepted', language: 'JavaScript', time: '2 hours ago', runtime: '56 ms' },
                    { problem: 'Reverse Linked List', verdict: 'Wrong Answer', language: 'Python', time: '5 hours ago', runtime: '-' },
                    { problem: 'Binary Search', verdict: 'Accepted', language: 'C++', time: '1 day ago', runtime: '32 ms' },
                    { problem: 'Valid Parentheses', verdict: 'Time Limit Exceeded', language: 'Java', time: '2 days ago', runtime: '-' },
                  ].map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                      <div>
                        <div className="font-medium text-white">{sub.problem}</div>
                        <div className="text-sm text-gray-500">{sub.language} • {sub.time}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          sub.verdict === 'Accepted' ? 'text-green-400' : 
                          sub.verdict === 'Wrong Answer' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {sub.verdict}
                        </div>
                        <div className="text-sm text-gray-500">{sub.runtime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'battles' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">⚔️ Battle History</h3>
                <div className="space-y-2">
                  {[
                    { opponent: 'Rakib', result: 'Won', problem: 'Two Sum', duration: '12:34', date: '2 hours ago' },
                    { opponent: 'Sadia', result: 'Lost', problem: 'Merge Sort', duration: '18:45', date: '5 hours ago' },
                    { opponent: 'Nabil', result: 'Won', problem: 'BFS Traversal', duration: '08:21', date: '1 day ago' },
                    { opponent: 'Tanha', result: 'Won', problem: 'Valid Parentheses', duration: '05:12', date: '2 days ago' },
                  ].map((battle, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          battle.result === 'Won' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {battle.result === 'Won' ? 'W' : 'L'}
                        </div>
                        <div>
                          <div className="font-medium text-white">vs {battle.opponent}</div>
                          <div className="text-sm text-gray-500">{battle.problem} • {battle.duration}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          battle.result === 'Won' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                        }`}>
                          {battle.result}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">{battle.date}</div>
                      </div>
                    </div>
                  ))}
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