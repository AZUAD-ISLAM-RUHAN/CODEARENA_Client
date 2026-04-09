import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Admin() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [showCreateContestModal, setShowCreateContestModal] = useState(false);
  const [newProblemInfo, setNewProblemInfo] = useState({ title: '', difficulty: 'Easy', topic: '', submissions: 0, acceptance: 0, status: 'active' });
  const [newContestInfo, setNewContestInfo] = useState({ title: '', startTime: '', duration: '60 min', participants: 0, status: 'upcoming' });

  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    activeBattles: 0,
    todaySubmissions: 0,
    newUsersToday: 0
  });
  const [loading, setLoading] = useState(true);

  // Problem filtering states
  const [problemSearch, setProblemSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');

  // User filtering states
  const [userSearch, setUserSearch] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('All');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');

  // Submission filtering states
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');

  // Admin check on load
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const token = localStorage.getItem('token');
    
    if (!isAdmin || !token) {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch problems
        const problemsResponse = await fetch('http://localhost:5001/api/problems?limit=1000', { headers });
        const problemsData = await problemsResponse.json();
        if (problemsData.problems) {
          const formattedProblems = problemsData.problems.map(problem => ({
            id: problem._id,
            title: problem.title,
            difficulty: problem.difficulty,
            topic: problem.category,
            submissions: problem.totalSubmissions || 0,
            acceptance: problem.acceptedSubmissions ? Math.round((problem.acceptedSubmissions / problem.totalSubmissions) * 100) : 0,
            status: problem.isActive ? 'active' : 'inactive'
          }));
          setProblems(formattedProblems);
        }

        // Fetch users
        const usersResponse = await fetch('http://localhost:5001/api/admin/users', { headers });
        const usersData = await usersResponse.json();
        if (usersData.users) {
          const formattedUsers = usersData.users.map(user => ({
            id: user._id,
            name: user.username,
            email: user.email,
            dept: user.department || 'CSE',
            batch: user.batch || '2022',
            status: user.isActive ? 'active' : 'banned',
            role: user.role || 'student',
            solved: user.solvedProblems ? user.solvedProblems.length : 0
          }));
          setUsers(formattedUsers);
        }

        // Fetch stats
        const statsResponse = await fetch('http://localhost:5001/api/admin/stats', { headers });
        const statsData = await statsResponse.json();
        if (statsData) {
          setStats(statsData);
        }

      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const departmentData = [
    { name: 'CSE', students: 450, submissions: 8500 },
    { name: 'EEE', students: 320, submissions: 3200 },
    { name: 'BBA', students: 280, submissions: 2100 },
    { name: 'ENG', students: 195, submissions: 1620 },
  ];

  const submissionTrend = [
    { day: 'Mon', submissions: 120 },
    { day: 'Tue', submissions: 145 },
    { day: 'Wed', submissions: 138 },
    { day: 'Thu', submissions: 190 },
    { day: 'Fri', submissions: 220 },
    { day: 'Sat', submissions: 280 },
    { day: 'Sun', submissions: 156 },
  ];

  const difficultyDistribution = [
    { name: 'Easy', value: 35, color: '#4ade80' },
    { name: 'Medium', value: 40, color: '#facc15' },
    { name: 'Hard', value: 20, color: '#f87171' },
    { name: 'Expert', value: 5, color: '#c084fc' },
  ];

  const submissions = [
    { id: 1, user: 'Arif Hossain', problem: 'Two Sum', language: 'JavaScript', verdict: 'Accepted', time: '2 min ago' },
    { id: 2, user: 'Rakib Hassan', problem: 'Binary Search', language: 'Python', verdict: 'Accepted', time: '5 min ago' },
    { id: 3, user: 'Sadia Islam', problem: 'Two Sum', language: 'C++', verdict: 'Wrong Answer', time: '12 min ago' },
    { id: 4, user: 'Nabil Ahmed', problem: 'Merge Sort', language: 'Java', verdict: 'Time Limit Exceeded', time: '15 min ago' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-400 bg-green-400/10',
      banned: 'text-red-400 bg-red-400/10',
      pending: 'text-yellow-400 bg-yellow-400/10',
      rejected: 'text-red-400 bg-red-400/10',
      upcoming: 'text-blue-400 bg-blue-400/10',
      ongoing: 'text-green-400 bg-green-400/10',
      ended: 'text-gray-400 bg-gray-400/10',
      Accepted: 'text-green-400',
      'Wrong Answer': 'text-red-400',
      'Time Limit Exceeded': 'text-yellow-400'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  const handleSaveProblem = () => {
    if (!newProblemInfo.title || !newProblemInfo.topic) {
      alert('Please add title & topic.');
      return;
    }
    setProblems(prev => [
      ...prev,
      {
        ...newProblemInfo,
        id: prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1,
      }
    ]);
    setNewProblemInfo({ title: '', difficulty: 'Easy', topic: '', submissions: 0, acceptance: 0, status: 'active' });
    setShowAddProblemModal(false);
    setActiveTab('problems');
  };

  const handleSaveContest = () => {
    if (!newContestInfo.title || !newContestInfo.startTime) {
      alert('Please add contest title and startTime.');
      return;
    }
    setContests(prev => [
      ...prev,
      {
        ...newContestInfo,
        id: prev.length ? Math.max(...prev.map(c => c.id)) + 1 : 1,
      }
    ]);
    setNewContestInfo({ title: '', startTime: '', duration: '60 min', participants: 0, status: 'upcoming' });
    setShowCreateContestModal(false);
    setActiveTab('contests');
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <motion.div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm mb-1 transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-1 transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{subtitle}</p>}
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </motion.div>
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  // Filter problems based on search and filters
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(problemSearch.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'All' || problem.status === statusFilter;
    const matchesTopic = topicFilter === 'All' || problem.topic === topicFilter;
    
    return matchesSearch && matchesDifficulty && matchesStatus && matchesTopic;
  });

  // Get unique topics for filter dropdown
  const uniqueTopics = [...new Set(problems.map(p => p.topic))].sort();

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesDept = userDeptFilter === 'All' || user.dept === userDeptFilter;
    const matchesRole = userRoleFilter === 'All' || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'All' || user.status === userStatusFilter;
    
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  // Get unique departments and roles for filter dropdowns
  const uniqueDepts = [...new Set(users.map(u => u.dept))].sort();
  const uniqueRoles = [...new Set(users.map(u => u.role))].sort();

  // Filter submissions based on search and filters
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.user.toLowerCase().includes(submissionSearch.toLowerCase()) || 
                         sub.problem.toLowerCase().includes(submissionSearch.toLowerCase());
    const matchesVerdict = verdictFilter === 'All' || sub.verdict === verdictFilter;
    const matchesLanguage = languageFilter === 'All' || sub.language === languageFilter;
    
    return matchesSearch && matchesVerdict && matchesLanguage;
  });

  // Get unique languages and verdicts for filter dropdowns
  const uniqueLanguages = [...new Set(submissions.map(s => s.language))].sort();
  const uniqueVerdicts = [...new Set(submissions.map(s => s.verdict))].sort();

  

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      {/* Admin Only Navbar - No Student Elements */}
      <nav className={`border-b transition-colors duration-300 px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-900 border-red-500/30' : 'bg-gray-50 border-red-200'}`}>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/admin')}>
            Code<span className="text-red-500">Arena</span>
          </h1>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold border transition ${isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200'}`}>
            🔴 ADMIN PANEL
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`text-right hidden md:block transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className={`text-sm font-medium transition ${isDark ? 'text-white' : 'text-gray-900'}`}>Administrator</div>
            <div className="text-xs">{localStorage.getItem('adminEmail') || 'admin@codearena.edu'}</div>
          </div>
          
          <ThemeToggle />

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition text-sm"
          >
            🚪 Logout
          </motion.button>
          
          <div className="w-9 h-9 rounded-full bg-red-500 text-white font-bold flex items-center justify-center border-2 border-red-400 hover:bg-red-600 transition">
            A
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`w-64 border-r transition-colors duration-300 min-h-screen p-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'users', label: '👥 Users', icon: '👥' },
              { id: 'problems', label: '📚 Problems', icon: '📚' },
              { id: 'submissions', label: '📝 Submissions', icon: '📝' },
              { id: 'contests', label: '🏆 Contests', icon: '🏆' },
              { id: 'analytics', label: '📈 Analytics', icon: '📈' },
            ].map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                  activeTab === item.id 
                    ? isDark ? 'bg-yellow-400 text-gray-950 font-semibold' : 'bg-yellow-400 text-gray-950 font-semibold'
                    : isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </motion.button>
            ))}
          </nav>

          <div className={`mt-8 pt-8 border-t transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`text-xs uppercase tracking-wider mb-3 transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Quick Actions</div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab('problems');
                setShowAddProblemModal(true);
              }}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-2 rounded-lg transition mb-2 text-sm flex items-center justify-center gap-2"
            >
              ➕ Add Problem
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab('contests');
                setShowCreateContestModal(true);
              }}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"
            >
              🎯 Create Contest
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 p-6 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="text-blue-400" subtitle={`+${stats.newUsersToday} today`} />
                <StatCard title="Total Problems" value={stats.totalProblems} icon="📚" color="text-purple-400" />
                <StatCard title="Total Submissions" value={stats.totalSubmissions} icon="📝" color="text-green-400" subtitle={`+${stats.todaySubmissions} today`} />
                <StatCard title="Active Battles" value={stats.activeBattles} icon="⚔️" color="text-red-400" />
                <StatCard title="Acceptance Rate" value="68%" icon="✅" color="text-yellow-400" />
                <StatCard title="Online Now" value="156" icon="🟢" color="text-green-400" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>Weekly Submission Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={submissionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="day" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                      <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb', border: 'none', color: isDark ? '#fff' : '#000' }} />
                      <Line type="monotone" dataKey="submissions" stroke="#facc15" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>Problem Difficulty Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={difficultyDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {difficultyDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb', border: 'none', color: isDark ? '#fff' : '#000' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {difficultyDistribution.map((item) => (
                      <div key={item.name} className={`flex items-center gap-2 text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className={`font-semibold mb-4 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>Department Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb', border: 'none', color: isDark ? '#fff' : '#000' }} />
                    <Bar dataKey="students" fill="#3b82f6" name="Students" />
                    <Bar dataKey="submissions" fill="#facc15" name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="flex gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Export
                  </motion.button>
                </div>
              </div>

              {/* User Filters */}
              <div className={`rounded-xl p-4 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <input 
                      type="text" 
                      placeholder="Search users by name or email..." 
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                    />
                  </div>
                  
                  <select 
                    value={userDeptFilter}
                    onChange={(e) => setUserDeptFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                  >
                    <option value="All">All Departments</option>
                    {uniqueDepts.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  <select 
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                  >
                    <option value="All">All Roles</option>
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                  </select>

                  <select 
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                  >
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                  </select>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setUserSearch('');
                      setUserDeptFilter('All');
                      setUserRoleFilter('All');
                      setUserStatusFilter('All');
                    }}
                    className="bg-gray-500 hover:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Clear Filters
                  </motion.button>
                </div>
                
                <div className={`mt-3 text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </div>

              <div className={`rounded-xl overflow-hidden border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <table className="w-full">
                  <thead>
                    <tr className={`border-b text-sm transition-colors duration-300 ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                      <th className="text-left px-6 py-4">User</th>
                      <th className="text-left px-6 py-4">Department</th>
                      <th className="text-left px-6 py-4">Role</th>
                      <th className="text-left px-6 py-4">Solved</th>
                      <th className="text-left px-6 py-4">Status</th>
                      <th className="text-left px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className={`border-b last:border-0 transition-colors duration-300 ${isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-900'}`}>
                              {user.name[0]}
                            </div>
                            <div>
                              <div className={`font-medium transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                              <div className={`text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 transition ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{user.dept} • {user.batch}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            user.role === 'teacher' ? 'bg-purple-400/10 text-purple-400' : 'bg-blue-400/10 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-yellow-400 font-medium">{user.solved}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                            <button className="text-red-400 hover:text-red-300 text-sm">
                              {user.status === 'banned' ? 'Unban' : 'Ban'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Problems Tab */}
          {activeTab === 'problems' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Problem Management</h2>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddProblemModal(true)}
                  className="bg-green-500 hover:bg-green-400 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <span>➕</span> Add New Problem
                </motion.button>
              </div>

              {/* Problem Filters */}
              <div className={`rounded-xl p-4 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <input 
                      type="text" 
                      placeholder="Search problems by title..." 
                      value={problemSearch}
                      onChange={(e) => setProblemSearch(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                    />
                  </div>
                  
                  <select 
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>

                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                  >
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select 
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                  >
                    <option value="All">All Topics</option>
                    {uniqueTopics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setProblemSearch('');
                      setDifficultyFilter('All');
                      setStatusFilter('All');
                      setTopicFilter('All');
                    }}
                    className="bg-gray-500 hover:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Clear Filters
                  </motion.button>
                </div>
                
                <div className={`mt-3 text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {filteredProblems.length} of {problems.length} problems
                </div>
              </div>

              <div className={`rounded-xl overflow-hidden border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <table className="w-full">
                  <thead>
                    <tr className={`border-b text-sm transition-colors duration-300 ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                      <th className="text-left px-6 py-4">Title</th>
                      <th className="text-left px-6 py-4">Difficulty</th>
                      <th className="text-left px-6 py-4">Topic</th>
                      <th className="text-left px-6 py-4">Submissions</th>
                      <th className="text-left px-6 py-4">Acceptance</th>
                      <th className="text-left px-6 py-4">Status</th>
                      <th className="text-left px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.map((problem) => (
                      <tr key={problem.id} className={`border-b last:border-0 transition-colors duration-300 ${isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 font-medium transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{problem.title}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            problem.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10' :
                            problem.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' :
                            'text-red-400 bg-red-400/10'
                          }`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className={`px-6 py-4 transition ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{problem.topic}</td>
                        <td className={`px-6 py-4 transition ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{problem.submissions}</td>
                        <td className="px-6 py-4 text-green-400">{problem.acceptance}%</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(problem.status)}`}>
                            {problem.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                            <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Recent Submissions</h2>
              
              {/* Submission Filters */}
              <div className={`rounded-xl p-4 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <input 
                      type="text" 
                      placeholder="Search submissions by user or problem..." 
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                    />
                  </div>
                  
                  <select 
                    value={verdictFilter}
                    onChange={(e) => setVerdictFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                  >
                    <option value="All">All Verdicts</option>
                    {uniqueVerdicts.map(verdict => (
                      <option key={verdict} value={verdict}>{verdict}</option>
                    ))}
                  </select>

                  <select 
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'}`}
                  >
                    <option value="All">All Languages</option>
                    {uniqueLanguages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSubmissionSearch('');
                      setVerdictFilter('All');
                      setLanguageFilter('All');
                    }}
                    className="bg-gray-500 hover:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Clear Filters
                  </motion.button>
                </div>
                
                <div className={`mt-3 text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {filteredSubmissions.length} of {submissions.length} submissions
                </div>
              </div>

              <div className={`rounded-xl overflow-hidden border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <table className="w-full">
                  <thead>
                    <tr className={`border-b text-sm transition-colors duration-300 ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                      <th className="text-left px-6 py-4">ID</th>
                      <th className="text-left px-6 py-4">User</th>
                      <th className="text-left px-6 py-4">Problem</th>
                      <th className="text-left px-6 py-4">Language</th>
                      <th className="text-left px-6 py-4">Verdict</th>
                      <th className="text-left px-6 py-4">Time</th>
                      <th className="text-left px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className={`border-b last:border-0 transition-colors duration-300 ${isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>#{sub.id}</td>
                        <td className={`px-6 py-4 font-medium transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{sub.user}</td>
                        <td className={`px-6 py-4 transition ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{sub.problem}</td>
                        <td className={`px-6 py-4 transition ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{sub.language}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${getStatusColor(sub.verdict)}`}>
                            {sub.verdict}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{sub.time}</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">View Code</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contests Tab */}
          {activeTab === 'contests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Contest Management</h2>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateContestModal(true)}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <span>🎯</span> Create Contest
                </motion.button>
              </div>

              <div className="grid gap-4">
                {contests.map((contest) => (
                  <motion.div 
                    key={contest.id} 
                    whileHover={{ scale: 1.01 }}
                    className={`rounded-xl p-6 border transition-colors duration-300 flex items-center justify-between ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
                  >
                    <div>
                      <h3 className={`font-bold text-lg mb-1 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{contest.title}</h3>
                      <div className={`flex items-center gap-4 text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>📅 {contest.startTime}</span>
                        <span>⏱️ {contest.duration}</span>
                        <span>👥 {contest.participants} participants</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(contest.status)}`}>
                        {contest.status}
                      </span>
                      <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                      <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Detailed Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Performers</h3>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: 'Rakib Hassan', dept: 'CSE', xp: 4850 },
                      { rank: 2, name: 'Sadia Islam', dept: 'CSE', xp: 4200 },
                      { rank: 3, name: 'Nabil Ahmed', dept: 'CSE', xp: 3900 },
                      { rank: 4, name: 'Tanha Begum', dept: 'EEE', xp: 3100 },
                      { rank: 5, name: 'Rifat Hossain', dept: 'CSE', xp: 2800 },
                    ].map((user) => (
                      <div key={user.rank} className={`flex items-center justify-between py-2 border-b last:border-0 transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-400 font-bold w-6">{user.rank}</span>
                          <span className={`transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</span>
                          <span className={`text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>({user.dept})</span>
                        </div>
                        <span className="text-yellow-400 font-medium">{user.xp.toLocaleString()} XP</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>Most Attempted Problems</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Two Sum', attempts: 1240, success: 68 },
                      { title: 'Valid Parentheses', attempts: 1300, success: 72 },
                      { title: 'Fibonacci (Memoization)', attempts: 1450, success: 85 },
                      { title: 'Binary Search', attempts: 1100, success: 55 },
                      { title: 'Reverse Linked List', attempts: 980, success: 52 },
                    ].map((prob, idx) => (
                      <div key={idx} className={`flex items-center justify-between py-2 border-b last:border-0 transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div>
                          <div className={`transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{prob.title}</div>
                          <div className={`text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{prob.attempts} attempts</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-medium">{prob.success}%</div>
                          <div className={`text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>success rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddProblemModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-96 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Problem</h3>
            <input
              type="text"
              placeholder="Problem Title"
              value={newProblemInfo.title}
              onChange={(e) => setNewProblemInfo(prev => ({ ...prev, title: e.target.value }))}
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Topic"
              value={newProblemInfo.topic}
              onChange={(e) => setNewProblemInfo(prev => ({ ...prev, topic: e.target.value }))}
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={newProblemInfo.difficulty}
              onChange={(e) => setNewProblemInfo(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                placeholder="Submissions"
                value={newProblemInfo.submissions}
                onChange={(e) => setNewProblemInfo(prev => ({ ...prev, submissions: Number(e.target.value) }))}
                className="w-1/2 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Acceptance %"
                value={newProblemInfo.acceptance}
                onChange={(e) => setNewProblemInfo(prev => ({ ...prev, acceptance: Number(e.target.value) }))}
                className="w-1/2 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddProblemModal(false)} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Cancel</button>
              <button onClick={handleSaveProblem} className="px-4 py-2 rounded-lg bg-green-500 text-white">Save</button>
            </div>
          </div>
        </div>
      )}

      {showCreateContestModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-96 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Contest</h3>
            <input
              type="text"
              placeholder="Contest Title"
              value={newContestInfo.title}
              onChange={(e) => setNewContestInfo(prev => ({ ...prev, title: e.target.value }))}
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="datetime-local"
              value={newContestInfo.startTime}
              onChange={(e) => setNewContestInfo(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Duration (e.g., 90 min)"
              value={newContestInfo.duration}
              onChange={(e) => setNewContestInfo(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full mb-4 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateContestModal(false)} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Cancel</button>
              <button onClick={handleSaveContest} className="px-4 py-2 rounded-lg bg-blue-500 text-white">Create</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;