// client/pages/Admin/Admin.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Admin() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5001/api';
  const PROBLEM_PAGE_SIZE = 25;

  const initialContestForm = {
    title: '',
    description: '',
    startTime: '',
    duration: 60,
    difficulty: 'Intermediate',
    maxParticipants: '',
    isPublic: true,
    problemIds: []
  };

  const initialProblemForm = {
    title: '',
    description: '',
    difficulty: 'Easy',
    category: '',
    tagsText: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    timeLimit: 1000,
    memoryLimit: 256,
    isActive: true,
    testCases: [
      { input: '', output: '', isHidden: false },
      { input: '', output: '', isHidden: true }
    ]
  };

  const contestDifficultyOptions = [
    'Easy',
    'Medium',
    'Hard',
    'Expert',
    'Mixed',
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  const problemDifficultyOptions = ['Easy', 'Medium', 'Hard', 'Expert'];

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [showCreateContestModal, setShowCreateContestModal] = useState(false);

  const [problemFormMode, setProblemFormMode] = useState('create');
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [problemForm, setProblemForm] = useState(initialProblemForm);
  const [problemActionLoading, setProblemActionLoading] = useState(false);
  const [problemDeleteLoadingId, setProblemDeleteLoadingId] = useState(null);

  const [contestForm, setContestForm] = useState(initialContestForm);
  const [editingContestId, setEditingContestId] = useState(null);
  const [contestActionLoading, setContestActionLoading] = useState(false);
  const [contestLeaderboardLoading, setContestLeaderboardLoading] = useState(false);
  const [contestProblemSearch, setContestProblemSearch] = useState('');

  const [selectedContestForLeaderboard, setSelectedContestForLeaderboard] = useState(null);
  const [selectedContestLeaderboard, setSelectedContestLeaderboard] = useState([]);

  const [problems, setProblems] = useState([]);
  const [allProblemOptions, setAllProblemOptions] = useState([]);
  const [problemCategories, setProblemCategories] = useState([]);
  const [problemPagination, setProblemPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1
  });

  const [contests, setContests] = useState([]);
  const [users, setUsers] = useState([]);
  const [platformLeaderboard, setPlatformLeaderboard] = useState([]);
  const [platformLeaderboardSummary, setPlatformLeaderboardSummary] = useState({
    totalUsers: 0,
    totalSolved: 0,
    totalBattlesWon: 0,
    averageRating: 0
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    activeBattles: 0,
    todaySubmissions: 0,
    newUsersToday: 0,
    departmentData: [],
    submissionTrend: [],
    difficultyDistribution: []
  });

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [problemSearch, setProblemSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [problemPage, setProblemPage] = useState(1);

  const [userSearch, setUserSearch] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('All');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');

  const [submissionSearch, setSubmissionSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');

  const [contestSearch, setContestSearch] = useState('');
  const [contestStatusFilter, setContestStatusFilter] = useState('All');
  const [contestDifficultyFilter, setContestDifficultyFilter] = useState('All');

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const token = localStorage.getItem('token');

    if (!isAdmin || !token) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const getAuthHeaders = (withJson = false) => {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`
    };

    if (withJson) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-400 bg-green-400/10',
      inactive: 'text-gray-400 bg-gray-400/10',
      banned: 'text-red-400 bg-red-400/10',
      pending: 'text-yellow-400 bg-yellow-400/10',
      rejected: 'text-red-400 bg-red-400/10',
      upcoming: 'text-blue-400 bg-blue-400/10',
      scheduled: 'text-blue-400 bg-blue-400/10',
      ongoing: 'text-green-400 bg-green-400/10',
      ended: 'text-gray-400 bg-gray-400/10',
      completed: 'text-gray-400 bg-gray-400/10',
      accepted: 'text-green-400',
      Accepted: 'text-green-400',
      wrong_answer: 'text-red-400',
      'Wrong Answer': 'text-red-400',
      time_limit_exceeded: 'text-yellow-400',
      'Time Limit Exceeded': 'text-yellow-400'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  const formatContestForForm = (contest) => ({
    title: contest.title || '',
    description: contest.description || '',
    startTime: contest.startTime ? new Date(contest.startTime).toISOString().slice(0, 16) : '',
    duration: contest.duration || 60,
    difficulty: contest.difficulty || 'Intermediate',
    maxParticipants: contest.maxParticipants ?? '',
    isPublic: contest.isPublic !== false,
    problemIds: Array.isArray(contest.problemIds)
      ? contest.problemIds.map((problem) => (typeof problem === 'object' ? problem._id : problem))
      : []
  });

  const formatContestForDisplay = (contest) => ({
    id: contest._id || contest.id,
    title: contest.title || 'Untitled Contest',
    description: contest.description || '',
    startTime: contest.startTime,
    endTime: contest.endTime,
    duration: contest.duration,
    difficulty: contest.difficulty || 'Intermediate',
    participantCount:
      contest.participantCount ||
      (Array.isArray(contest.participants) ? contest.participants.length : 0),
    participants: contest.participants || [],
    status: contest.status || 'scheduled',
    isPublic: contest.isPublic !== false,
    maxParticipants: contest.maxParticipants ?? null,
    createdBy:
      typeof contest.createdBy === 'object'
        ? contest.createdBy?.username || 'Admin'
        : contest.createdBy || 'Admin',
    problemCount: Array.isArray(contest.problemIds) ? contest.problemIds.length : 0,
    problemIds: Array.isArray(contest.problemIds)
      ? contest.problemIds.map((problem) => (typeof problem === 'object' ? problem._id : problem))
      : [],
    problemTitles: Array.isArray(contest.problemIds)
      ? contest.problemIds
          .map((problem) => (typeof problem === 'object' ? problem.title : ''))
          .filter(Boolean)
      : [],
    isFinalized: Boolean(contest.isFinalized),
    leaderboard: Array.isArray(contest.leaderboard) ? contest.leaderboard : []
  });

  const formatProblemForModal = (problem) => ({
    title: problem.title || '',
    description: problem.description || '',
    difficulty: problem.difficulty || 'Easy',
    category: problem.category || '',
    tagsText: Array.isArray(problem.tags) ? problem.tags.join(', ') : '',
    inputFormat: problem.inputFormat || '',
    outputFormat: problem.outputFormat || '',
    constraints: problem.constraints || '',
    sampleInput: problem.sampleInput || '',
    sampleOutput: problem.sampleOutput || '',
    timeLimit: problem.timeLimit || 1000,
    memoryLimit: problem.memoryLimit || 256,
    isActive: problem.isActive !== false,
    testCases:
      Array.isArray(problem.testCases) && problem.testCases.length > 0
        ? problem.testCases.map((testCase) => ({
            input: testCase.input || '',
            output: testCase.output || '',
            isHidden: Boolean(testCase.isHidden)
          }))
        : [
            { input: '', output: '', isHidden: false },
            { input: '', output: '', isHidden: true }
          ]
  });

  const normalizeProblemSummary = (problem) => ({
    id: problem._id || problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    topic: problem.category || 'General',
    submissions: problem.totalSubmissions || 0,
    acceptance:
      typeof problem.acceptanceRate === 'number'
        ? problem.acceptanceRate
        : problem.acceptedSubmissions
          ? Math.round((problem.acceptedSubmissions / Math.max(problem.totalSubmissions || 1, 1)) * 100)
          : 0,
    status: problem.isActive ? 'active' : 'inactive',
    testCaseCount:
      typeof problem.testCaseCount === 'number'
        ? problem.testCaseCount
        : Array.isArray(problem.testCases)
          ? problem.testCases.length
          : 0,
    createdAt: problem.createdAt,
    updatedAt: problem.updatedAt
  });

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString();
  };

  const formatSubmissionTime = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleString();
  };

  const buildProblemAdminQuery = useCallback((pageNumber) => {
    const params = new URLSearchParams();
    params.set('page', String(pageNumber));
    params.set('limit', String(PROBLEM_PAGE_SIZE));

    if (problemSearch.trim()) {
      params.set('search', problemSearch.trim());
    }
    if (difficultyFilter !== 'All') {
      params.set('difficulty', difficultyFilter);
    }
    if (statusFilter !== 'All') {
      params.set('status', statusFilter);
    }
    if (topicFilter !== 'All') {
      params.set('category', topicFilter);
    }

    return params.toString();
  }, [problemSearch, difficultyFilter, statusFilter, topicFilter]);

  const fetchProblems = useCallback(async (headers, pageNumber = 1) => {
    const response = await fetch(
      `${API_BASE}/problems/admin/list?${buildProblemAdminQuery(pageNumber)}`,
      { headers }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch problems');
    }

    setProblems(Array.isArray(data.problems) ? data.problems.map(normalizeProblemSummary) : []);
    setProblemCategories(Array.isArray(data.categories) ? data.categories : []);
    setProblemPagination({
      total: data.total || 0,
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || pageNumber
    });
  }, [API_BASE, buildProblemAdminQuery]);

  const fetchAllProblemOptions = useCallback(async (headers) => {
    const response = await fetch(`${API_BASE}/problems?limit=1000`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch problem options');
    }

    const formatted = Array.isArray(data.problems)
      ? data.problems.map((problem) => ({
          id: problem._id,
          title: problem.title,
          difficulty: problem.difficulty,
          topic: problem.category || 'General',
          submissions: problem.totalSubmissions || 0,
          acceptance: problem.acceptedSubmissions
            ? Math.round((problem.acceptedSubmissions / Math.max(problem.totalSubmissions || 1, 1)) * 100)
            : 0
        }))
      : [];

    setAllProblemOptions(formatted);
  }, [API_BASE]);

  const fetchProblemById = useCallback(async (problemId) => {
    const response = await fetch(`${API_BASE}/problems/admin/${problemId}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load problem');
    }

    return data.problem;
  }, []);

  const fetchUsers = useCallback(async (headers) => {
    const response = await fetch(`${API_BASE}/admin/users`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }

    const formattedUsers = Array.isArray(data.users)
      ? data.users.map((user) => ({
          id: user._id,
          name: user.username,
          email: user.email,
          dept: user.department || 'CSE',
          batch: user.batch || '2022',
          status: user.isActive === false ? 'banned' : 'active',
          role: user.role || 'user',
          solved: Array.isArray(user.solvedProblems) ? user.solvedProblems.length : 0
        }))
      : [];

    setUsers(formattedUsers);
  }, [API_BASE]);

  const fetchStats = useCallback(async (headers) => {
    const response = await fetch(`${API_BASE}/admin/stats`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch stats');
    }

    setStats({
      totalUsers: data.totalUsers || 0,
      totalProblems: data.totalProblems || 0,
      totalSubmissions: data.totalSubmissions || 0,
      activeBattles: data.activeBattles || 0,
      todaySubmissions: data.todaySubmissions || 0,
      newUsersToday: data.newUsersToday || 0,
      departmentData: Array.isArray(data.departmentData) ? data.departmentData : [],
      submissionTrend: Array.isArray(data.submissionTrend) ? data.submissionTrend : [],
      difficultyDistribution: Array.isArray(data.difficultyDistribution) ? data.difficultyDistribution : []
    });
  }, [API_BASE]);

  const fetchSubmissions = useCallback(async (headers) => {
    const response = await fetch(`${API_BASE}/admin/submissions?limit=200`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch submissions');
    }

    setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
  }, [API_BASE]);

  const fetchContests = useCallback(async (headers) => {
    const response = await fetch(`${API_BASE}/contests?limit=1000`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch contests');
    }

    setContests(Array.isArray(data.contests) ? data.contests.map(formatContestForDisplay) : []);
  }, [API_BASE]);

  const fetchPlatformLeaderboard = useCallback(async (headers) => {
    const response = await fetch(`${API_BASE}/leaderboard?sortBy=rating&limit=20`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch leaderboard');
    }

    if (Array.isArray(data.leaderboard)) {
      setPlatformLeaderboard(data.leaderboard);
      setPlatformLeaderboardSummary(
        data.summary || {
          totalUsers: data.leaderboard.length,
          totalSolved: 0,
          totalBattlesWon: 0,
          averageRating: 0
        }
      );
    }
  }, [API_BASE]);

  const refreshAllAdminData = useCallback(async (pageNumber = problemPage) => {
    const headers = getAuthHeaders();
    await Promise.all([
      fetchProblems(headers, pageNumber),
      fetchAllProblemOptions(headers),
      fetchUsers(headers),
      fetchStats(headers),
      fetchSubmissions(headers),
      fetchContests(headers),
      fetchPlatformLeaderboard(headers)
    ]);
  }, [
    problemPage,
    fetchProblems,
    fetchAllProblemOptions,
    fetchUsers,
    fetchStats,
    fetchSubmissions,
    fetchContests,
    fetchPlatformLeaderboard
  ]);

  useEffect(() => {
    const run = async () => {
      try {
        await refreshAllAdminData(problemPage);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [problemPage, refreshAllAdminData]);

  useEffect(() => {
    setProblemPage(1);
  }, [problemSearch, difficultyFilter, statusFilter, topicFilter]);

  const resetProblemModal = () => {
    setProblemForm(initialProblemForm);
    setProblemFormMode('create');
    setEditingProblemId(null);
    setShowAddProblemModal(false);
  };

  const openCreateProblemModal = () => {
    setProblemForm(initialProblemForm);
    setProblemFormMode('create');
    setEditingProblemId(null);
    setShowAddProblemModal(true);
  };

  const openEditProblemModal = async (problemId) => {
    try {
      setProblemActionLoading(true);
      const problem = await fetchProblemById(problemId);
      setProblemForm(formatProblemForModal(problem));
      setProblemFormMode('edit');
      setEditingProblemId(problemId);
      setShowAddProblemModal(true);
    } catch (error) {
      console.error('Load problem error:', error);
      alert(error.message || 'Failed to load problem');
    } finally {
      setProblemActionLoading(false);
    }
  };

  const buildProblemPayload = () => ({
    title: problemForm.title.trim(),
    description: problemForm.description.trim(),
    difficulty: problemForm.difficulty,
    category: problemForm.category.trim(),
    tags: problemForm.tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    inputFormat: problemForm.inputFormat.trim(),
    outputFormat: problemForm.outputFormat.trim(),
    constraints: problemForm.constraints.trim(),
    sampleInput: problemForm.sampleInput,
    sampleOutput: problemForm.sampleOutput,
    timeLimit: Number(problemForm.timeLimit),
    memoryLimit: Number(problemForm.memoryLimit),
    isActive: Boolean(problemForm.isActive),
    testCases: problemForm.testCases.map((testCase) => ({
      input: testCase.input,
      output: testCase.output,
      isHidden: Boolean(testCase.isHidden)
    }))
  });

  const handleSaveProblem = async () => {
    try {
      setProblemActionLoading(true);

      const url =
        problemFormMode === 'edit' && editingProblemId
          ? `${API_BASE}/problems/${editingProblemId}`
          : `${API_BASE}/problems`;

      const method = problemFormMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify(buildProblemPayload())
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save problem');
      }

      await Promise.all([
        fetchProblems(getAuthHeaders(), problemPage),
        fetchAllProblemOptions(getAuthHeaders()),
        fetchStats(getAuthHeaders())
      ]);

      resetProblemModal();
      setActiveTab('problems');
    } catch (error) {
      console.error('Save problem error:', error);
      alert(error.message || 'Failed to save problem');
    } finally {
      setProblemActionLoading(false);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    const confirmed = window.confirm('Are you sure you want to delete this problem?');
    if (!confirmed) return;

    try {
      setProblemDeleteLoadingId(problemId);

      const response = await fetch(`${API_BASE}/problems/${problemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete problem');
      }

      const nextPage =
        problems.length === 1 && problemPage > 1 ? problemPage - 1 : problemPage;

      if (nextPage !== problemPage) {
        setProblemPage(nextPage);
      } else {
        await fetchProblems(getAuthHeaders(), nextPage);
      }

      await Promise.all([
        fetchAllProblemOptions(getAuthHeaders()),
        fetchStats(getAuthHeaders())
      ]);
    } catch (error) {
      console.error('Delete problem error:', error);
      alert(error.message || 'Failed to delete problem');
    } finally {
      setProblemDeleteLoadingId(null);
    }
  };

  const handleUserStatusToggle = async (user) => {
    try {
      const nextIsActive = user.status === 'banned';
      const response = await fetch(`${API_BASE}/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ isActive: nextIsActive })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user status');
      }

      await Promise.all([
        fetchUsers(getAuthHeaders()),
        fetchStats(getAuthHeaders())
      ]);
    } catch (error) {
      console.error('User status error:', error);
      alert(error.message || 'Failed to update user status');
    }
  };

  const resetContestModal = () => {
    setContestForm(initialContestForm);
    setEditingContestId(null);
    setContestProblemSearch('');
    setShowCreateContestModal(false);
  };

  const openCreateContestModal = () => {
    setEditingContestId(null);
    setContestForm(initialContestForm);
    setContestProblemSearch('');
    setShowCreateContestModal(true);
  };

  const openEditContestModal = (contest) => {
    setEditingContestId(contest.id);
    setContestForm(formatContestForForm(contest));
    setContestProblemSearch('');
    setShowCreateContestModal(true);
  };

  const handleContestProblemToggle = (problemId) => {
    setContestForm((prev) => ({
      ...prev,
      problemIds: prev.problemIds.includes(problemId)
        ? prev.problemIds.filter((id) => id !== problemId)
        : [...prev.problemIds, problemId]
    }));
  };

  const handleSaveContest = async () => {
    if (
      !contestForm.title.trim() ||
      !contestForm.description.trim() ||
      !contestForm.startTime ||
      !contestForm.duration
    ) {
      alert('Please add contest title, description, start time, and duration.');
      return;
    }

    if (contestForm.problemIds.length === 0) {
      alert('Please select at least one problem for the contest.');
      return;
    }

    try {
      setContestActionLoading(true);

      const payload = {
        title: contestForm.title.trim(),
        description: contestForm.description.trim(),
        startTime: new Date(contestForm.startTime).toISOString(),
        duration: Number(contestForm.duration),
        difficulty: contestForm.difficulty,
        maxParticipants:
          contestForm.maxParticipants === '' || contestForm.maxParticipants === null
            ? null
            : Number(contestForm.maxParticipants),
        isPublic: Boolean(contestForm.isPublic),
        problemIds: contestForm.problemIds
      };

      const url = editingContestId
        ? `${API_BASE}/contests/${editingContestId}`
        : `${API_BASE}/contests`;
      const method = editingContestId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save contest');
      }

      await Promise.all([
        fetchContests(getAuthHeaders()),
        fetchPlatformLeaderboard(getAuthHeaders())
      ]);

      resetContestModal();
      setActiveTab('contests');
    } catch (error) {
      console.error('Save contest error:', error);
      alert(error.message || 'Failed to save contest');
    } finally {
      setContestActionLoading(false);
    }
  };

  const handleDeleteContest = async (contestId) => {
    const confirmed = window.confirm('Are you sure you want to delete this contest?');
    if (!confirmed) return;

    try {
      setContestActionLoading(true);

      const response = await fetch(`${API_BASE}/contests/${contestId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete contest');
      }

      if (selectedContestForLeaderboard?.id === contestId) {
        setSelectedContestForLeaderboard(null);
        setSelectedContestLeaderboard([]);
      }

      await fetchContests(getAuthHeaders());
    } catch (error) {
      console.error('Delete contest error:', error);
      alert(error.message || 'Failed to delete contest');
    } finally {
      setContestActionLoading(false);
    }
  };

  const handleFinalizeContest = async (contestId) => {
    try {
      setContestActionLoading(true);

      const response = await fetch(`${API_BASE}/contests/${contestId}/finalize`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to finalize contest');
      }

      await Promise.all([
        fetchContests(getAuthHeaders()),
        fetchPlatformLeaderboard(getAuthHeaders())
      ]);

      if (data.contest) {
        setSelectedContestForLeaderboard(formatContestForDisplay(data.contest));
      }
      if (Array.isArray(data.leaderboard)) {
        setSelectedContestLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Finalize contest error:', error);
      alert(error.message || 'Failed to finalize contest');
    } finally {
      setContestActionLoading(false);
    }
  };

  const handleViewContestLeaderboard = async (contest) => {
    try {
      setContestLeaderboardLoading(true);

      const response = await fetch(`${API_BASE}/contests/${contest.id}/leaderboard`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load contest leaderboard');
      }

      setSelectedContestForLeaderboard(formatContestForDisplay(data.contest || contest));
      setSelectedContestLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
    } catch (error) {
      console.error('Leaderboard load error:', error);
      alert(error.message || 'Failed to load contest leaderboard');
    } finally {
      setContestLeaderboardLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  const updateProblemField = (field, value) => {
    setProblemForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const addProblemTestCase = () => {
    setProblemForm((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', output: '', isHidden: true }]
    }));
  };

  const handleProblemTestCaseChange = (index, field, value) => {
    setProblemForm((prev) => ({
      ...prev,
      testCases: prev.testCases.map((testCase, testCaseIndex) =>
        testCaseIndex === index ? { ...testCase, [field]: value } : testCase
      )
    }));
  };

  const removeProblemTestCase = (index) => {
    setProblemForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, testCaseIndex) => testCaseIndex !== index)
    }));
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const searchValue = userSearch.toLowerCase();
        const matchesSearch =
          user.name.toLowerCase().includes(searchValue) ||
          user.email.toLowerCase().includes(searchValue);
        const matchesDept = userDeptFilter === 'All' || user.dept === userDeptFilter;
        const matchesRole = userRoleFilter === 'All' || user.role === userRoleFilter;
        const matchesStatus = userStatusFilter === 'All' || user.status === userStatusFilter;

        return matchesSearch && matchesDept && matchesRole && matchesStatus;
      }),
    [users, userSearch, userDeptFilter, userRoleFilter, userStatusFilter]
  );

  const uniqueDepts = useMemo(
    () => [...new Set(users.map((u) => u.dept).filter(Boolean))].sort(),
    [users]
  );

  const uniqueRoles = useMemo(
    () => [...new Set(users.map((u) => u.role).filter(Boolean))].sort(),
    [users]
  );

  const filteredSubmissions = useMemo(
    () =>
      submissions.filter((sub) => {
        const searchValue = submissionSearch.toLowerCase();
        const matchesSearch =
          sub.user.toLowerCase().includes(searchValue) ||
          sub.problem.toLowerCase().includes(searchValue);
        const matchesVerdict = verdictFilter === 'All' || sub.verdict === verdictFilter;
        const matchesLanguage = languageFilter === 'All' || sub.language === languageFilter;

        return matchesSearch && matchesVerdict && matchesLanguage;
      }),
    [submissions, submissionSearch, verdictFilter, languageFilter]
  );

  const uniqueLanguages = useMemo(
    () => [...new Set(submissions.map((s) => s.language).filter(Boolean))].sort(),
    [submissions]
  );

  const uniqueVerdicts = useMemo(
    () => [...new Set(submissions.map((s) => s.verdict).filter(Boolean))].sort(),
    [submissions]
  );

  const filteredContests = useMemo(
    () =>
      contests.filter((contest) => {
        const matchesSearch = contest.title.toLowerCase().includes(contestSearch.toLowerCase());

        const normalizedContestStatus =
          contest.status === 'scheduled'
            ? 'upcoming'
            : contest.status === 'completed'
              ? 'ended'
              : contest.status;

        const matchesStatus =
          contestStatusFilter === 'All' || normalizedContestStatus === contestStatusFilter;

        const matchesDifficulty =
          contestDifficultyFilter === 'All' || contest.difficulty === contestDifficultyFilter;

        return matchesSearch && matchesStatus && matchesDifficulty;
      }),
    [contests, contestSearch, contestStatusFilter, contestDifficultyFilter]
  );

  const filteredContestProblemOptions = useMemo(() => {
    const searchValue = contestProblemSearch.trim().toLowerCase();
    if (!searchValue) return allProblemOptions;

    return allProblemOptions.filter((problem) => {
      return (
        problem.title.toLowerCase().includes(searchValue) ||
        problem.topic.toLowerCase().includes(searchValue) ||
        problem.difficulty.toLowerCase().includes(searchValue)
      );
    });
  }, [allProblemOptions, contestProblemSearch]);

  const topAttemptedProblems = useMemo(() => {
    return [...allProblemOptions]
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 5);
  }, [allProblemOptions]);

  const departmentData = stats.departmentData || [];
  const submissionTrend = stats.submissionTrend || [];
  const difficultyDistribution = stats.difficultyDistribution || [];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <motion.div
      className={`rounded-xl p-6 border transition-colors duration-300 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm mb-1 transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'
        }`}
      >
        Loading admin panel...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <nav
        className={`border-b transition-colors duration-300 px-6 py-4 flex items-center justify-between ${
          isDark ? 'bg-gray-900 border-red-500/30' : 'bg-gray-50 border-red-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/admin')}>
            Code<span className="text-red-500">Arena</span>
          </h1>
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold border transition ${
              isDark
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-red-100 text-red-700 border-red-200'
            }`}
          >
            🔴 ADMIN PANEL
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`text-right hidden md:block transition ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <div className={`text-sm font-medium transition ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Administrator
            </div>
            <div className="text-xs">
              {localStorage.getItem('adminEmail') || 'admin@codearena.edu'}
            </div>
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
        <div
          className={`w-64 border-r transition-colors duration-300 min-h-screen p-4 ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: ' Dashboard', icon: '📊' },
              { id: 'users', label: ' Users', icon: '👥' },
              { id: 'problems', label: ' Problems', icon: '📚' },
              { id: 'submissions', label: ' Submissions', icon: '📝' },
              { id: 'contests', label: ' Contests', icon: '🏆' },
              { id: 'analytics', label: ' Analytics', icon: '📈' }
            ].map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                  activeTab === item.id
                    ? 'bg-yellow-400 text-gray-950 font-semibold'
                    : isDark
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </motion.button>
            ))}
          </nav>

          <div
            className={`mt-8 pt-8 border-t transition-colors duration-300 ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            <div className={`text-xs uppercase tracking-wider mb-3 transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Quick Actions
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab('problems');
                openCreateProblemModal();
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
                openCreateContestModal();
              }}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"
            >
              🎯 Create Contest
            </motion.button>
          </div>
        </div>

        <div className={`flex-1 p-6 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="text-blue-400" subtitle={`+${stats.newUsersToday} today`} />
                <StatCard title="Total Problems" value={stats.totalProblems} icon="📚" color="text-purple-400" />
                <StatCard title="Total Submissions" value={stats.totalSubmissions} icon="📝" color="text-green-400" subtitle={`+${stats.todaySubmissions} today`} />
                <StatCard title="Active Battles" value={stats.activeBattles} icon="⚔️" color="text-red-400" />
                <StatCard title="Average Rating" value={platformLeaderboardSummary.averageRating || 0} icon="⭐" color="text-yellow-400" />
                <StatCard title="Contests" value={contests.length} icon="🏆" color="text-cyan-400" />
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

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Management</h2>
              </div>

              <div className={`rounded-xl p-4 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 transition-colors duration-300 focus:outline-none ${
                        isDark
                          ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                          : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                      }`}
                    />
                  </div>

                  <select
                    value={userDeptFilter}
                    onChange={(e) => setUserDeptFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Departments</option>
                    {uniqueDepts.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Roles</option>
                    {uniqueRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                  </select>
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
                              {user.name?.[0] || 'U'}
                            </div>
                            <div>
                              <div className={`font-medium transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                              <div className={`text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 transition ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {user.dept} • {user.batch}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            user.role === 'admin'
                              ? 'bg-red-400/10 text-red-400'
                              : 'bg-blue-400/10 text-blue-400'
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
                            <button
                              onClick={() => handleUserStatusToggle(user)}
                              className={`${user.status === 'banned' ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'} text-sm`}
                            >
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

          {activeTab === 'problems' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Problem Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openCreateProblemModal}
                  className="bg-green-500 hover:bg-green-400 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <span>➕</span> Add New Problem
                </motion.button>
              </div>

              <div className={`rounded-xl p-4 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search problems by title..."
                      value={problemSearch}
                      onChange={(e) => setProblemSearch(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 transition-colors duration-300 focus:outline-none ${
                        isDark
                          ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                          : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                      }`}
                    />
                  </div>

                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Difficulties</option>
                    {problemDifficultyOptions.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Topics</option>
                    {problemCategories.map((topic) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <div className={`mt-3 text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {problems.length} of {problemPagination.total} problems
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
                    {problems.map((problem) => (
                      <tr key={problem.id} className={`border-b last:border-0 transition-colors duration-300 ${isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 font-medium transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{problem.title}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            problem.difficulty === 'Easy'
                              ? 'text-green-400 bg-green-400/10'
                              : problem.difficulty === 'Medium'
                                ? 'text-yellow-400 bg-yellow-400/10'
                                : problem.difficulty === 'Hard'
                                  ? 'text-red-400 bg-red-400/10'
                                  : 'text-purple-400 bg-purple-400/10'
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
                            <button
                              onClick={() => openEditProblemModal(problem.id)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProblem(problem.id)}
                              disabled={problemDeleteLoadingId === problem.id}
                              className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                            >
                              {problemDeleteLoadingId === problem.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setProblemPage((prev) => Math.max(prev - 1, 1))}
                  disabled={problemPagination.currentPage <= 1}
                  className={`px-4 py-2 rounded-lg border transition ${
                    isDark
                      ? 'border-gray-700 text-gray-300 disabled:opacity-50'
                      : 'border-gray-300 text-gray-700 disabled:opacity-50'
                  }`}
                >
                  Previous
                </button>

                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Page {problemPagination.currentPage} of {problemPagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    setProblemPage((prev) => Math.min(prev + 1, problemPagination.totalPages))
                  }
                  disabled={problemPagination.currentPage >= problemPagination.totalPages}
                  className={`px-4 py-2 rounded-lg border transition ${
                    isDark
                      ? 'border-gray-700 text-gray-300 disabled:opacity-50'
                      : 'border-gray-300 text-gray-700 disabled:opacity-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Recent Submissions</h2>

              <div className={`rounded-xl p-4 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search submissions by user or problem..."
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 transition-colors duration-300 focus:outline-none ${
                        isDark
                          ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                          : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                      }`}
                    />
                  </div>

                  <select
                    value={verdictFilter}
                    onChange={(e) => setVerdictFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Verdicts</option>
                    {uniqueVerdicts.map((verdict) => (
                      <option key={verdict} value={verdict}>{verdict}</option>
                    ))}
                  </select>

                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Languages</option>
                    {uniqueLanguages.map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
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
                        <td className={`px-6 py-4 text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{formatSubmissionTime(sub.time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'contests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Contest Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openCreateContestModal}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <span>🎯</span> Create Contest
                </motion.button>
              </div>

              <div className={`rounded-xl p-4 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[220px]">
                    <input
                      type="text"
                      placeholder="Search contests..."
                      value={contestSearch}
                      onChange={(e) => setContestSearch(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 transition-colors duration-300 focus:outline-none ${
                        isDark
                          ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                          : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                      }`}
                    />
                  </div>

                  <select
                    value={contestStatusFilter}
                    onChange={(e) => setContestStatusFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="ended">Ended</option>
                  </select>

                  <select
                    value={contestDifficultyFilter}
                    onChange={(e) => setContestDifficultyFilter(e.target.value)}
                    className={`border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-yellow-400'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-yellow-500'
                    }`}
                  >
                    <option value="All">All Difficulties</option>
                    {contestDifficultyOptions.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                <div className={`mt-3 text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {filteredContests.length} of {contests.length} contests
                </div>
              </div>

              <div className="grid gap-4">
                {filteredContests.map((contest) => (
                  <motion.div
                    key={contest.id}
                    whileHover={{ scale: 1.01 }}
                    className={`rounded-xl p-6 border transition-colors duration-300 ${
                      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-2 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {contest.title}
                        </h3>
                        <p className={`text-sm mb-3 transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {contest.description || 'No description'}
                        </p>

                        <div className={`flex flex-wrap items-center gap-4 text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span>📅 {formatDateTime(contest.startTime)}</span>
                          <span>⏱️ {contest.duration} min</span>
                          <span>👥 {contest.participantCount} participants</span>
                          <span>🧩 {contest.problemCount} problems</span>
                          <span>🎚️ {contest.difficulty}</span>
                          <span>{contest.isPublic ? '🌍 Public' : '🔒 Private'}</span>
                        </div>

                        {contest.problemTitles.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {contest.problemTitles.map((title, index) => (
                              <span
                                key={`${contest.id}-problem-${index}`}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  isDark
                                    ? 'bg-gray-800 text-gray-300'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 min-w-[240px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(contest.status)}`}>
                            {contest.status}
                          </span>
                          {contest.isFinalized && (
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-400/10 text-purple-400">
                              finalized
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => openEditContestModal(contest)}
                            className="text-sm px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteContest(contest.id)}
                            disabled={contestActionLoading || contest.isFinalized}
                            className="text-sm px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                          >
                            Delete
                          </button>

                          <button
                            onClick={() => handleViewContestLeaderboard(contest)}
                            disabled={contestLeaderboardLoading}
                            className="text-sm px-3 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition disabled:opacity-50"
                          >
                            Leaderboard
                          </button>

                          <button
                            onClick={() => handleFinalizeContest(contest.id)}
                            disabled={contestActionLoading || contest.status !== 'completed' || contest.isFinalized}
                            className="text-sm px-3 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition disabled:opacity-50"
                          >
                            Finalize
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold transition ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Contest Leaderboard
                    </h3>
                    {selectedContestForLeaderboard && (
                      <span className={`text-sm transition ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedContestForLeaderboard.title}
                      </span>
                    )}
                  </div>

                  {contestLeaderboardLoading ? (
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading leaderboard...</div>
                  ) : !selectedContestForLeaderboard ? (
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select a contest and click Leaderboard.
                    </div>
                  ) : selectedContestLeaderboard.length === 0 ? (
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No leaderboard data yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedContestLeaderboard.map((entry, index) => {
                        const displayName =
                          entry.userId?.firstName || entry.userId?.lastName
                            ? `${entry.userId?.firstName || ''} ${entry.userId?.lastName || ''}`.trim()
                            : entry.userId?.username || 'Unknown User';

                        return (
                          <div
                            key={`${entry.userId?._id || index}-${entry.rank}`}
                            className={`flex items-center justify-between py-3 border-b last:border-0 ${
                              isDark ? 'border-gray-800' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-yellow-400 font-bold w-8">#{entry.rank}</span>
                              <div>
                                <div className={isDark ? 'text-white' : 'text-gray-900'}>{displayName}</div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                  Solved {entry.solvedProblems} • Time {entry.totalTime}s • Subs {entry.submissions}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-yellow-400 font-semibold">{entry.newRating ?? entry.oldRating ?? 1200}</div>
                              <div className={`text-xs ${(entry.ratingChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {(entry.ratingChange || 0) >= 0 ? '+' : ''}{entry.ratingChange || 0}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Platform Leaderboard
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Users</div>
                      <div className="text-xl font-bold text-blue-400">{platformLeaderboardSummary.totalUsers}</div>
                    </div>
                    <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Rating</div>
                      <div className="text-xl font-bold text-yellow-400">{platformLeaderboardSummary.averageRating}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {platformLeaderboard.slice(0, 10).map((user) => (
                      <div
                        key={user.userId}
                        className={`flex items-center justify-between py-3 border-b last:border-0 ${
                          isDark ? 'border-gray-800' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-400 font-bold w-8">#{user.rank}</span>
                          <div>
                            <div className={isDark ? 'text-white' : 'text-gray-900'}>
                              {user.displayName || user.username}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                              Solved {user.solvedCount} • XP {user.xp}
                            </div>
                          </div>
                        </div>
                        <div className="text-yellow-400 font-semibold">{user.rating}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Detailed Analytics</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Performers</h3>
                  <div className="space-y-3">
                    {platformLeaderboard.slice(0, 5).map((user) => (
                      <div key={user.userId} className={`flex items-center justify-between py-2 border-b last:border-0 transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-400 font-bold w-6">{user.rank}</span>
                          <span className={`transition ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.displayName || user.username}
                          </span>
                        </div>
                        <span className="text-yellow-400 font-medium">{user.rating} Rating</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
  <h3 className={`font-semibold mb-4 transition ${isDark ? 'text-white' : 'text-gray-900'}`}>Most Attempted Problems</h3>
  <div className="space-y-3">
    {topAttemptedProblems.map((prob, idx) => (
      <div key={idx} className={`flex items-center justify-between py-2 border-b last:border-0 transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div>
          <div className={`transition ${isDark ? 'text-white' : 'text-gray-900'}`}>{prob.title}</div>
          <div className={`text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{prob.submissions} attempts</div>
        </div>
        <div className="text-right">
          <div className="text-green-400 font-medium">{prob.acceptance}%</div>
          <div className={`text-sm transition ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            success rate
          </div>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <h3 className="text-xl font-bold">
                {problemFormMode === 'edit' ? 'Edit Problem' : 'Create New Problem'}
              </h3>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Problem Title"
                  value={problemForm.title}
                  onChange={(e) => updateProblemField('title', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                />

                <select
                  value={problemForm.difficulty}
                  onChange={(e) => updateProblemField('difficulty', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                >
                  {problemDifficultyOptions.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Category / Topic"
                  value={problemForm.category}
                  onChange={(e) => updateProblemField('category', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                />

                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={problemForm.tagsText}
                  onChange={(e) => updateProblemField('tagsText', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                />
              </div>

              <textarea
                rows={8}
                placeholder="Problem Description"
                value={problemForm.description}
                onChange={(e) => updateProblemField('description', e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea
                  rows={5}
                  placeholder="Input Format"
                  value={problemForm.inputFormat}
                  onChange={(e) => updateProblemField('inputFormat', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                />

                <textarea
                  rows={5}
                  placeholder="Output Format"
                  value={problemForm.outputFormat}
                  onChange={(e) => updateProblemField('outputFormat', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                />

                <textarea
                  rows={5}
                  placeholder="Constraints"
                  value={problemForm.constraints}
                  onChange={(e) => updateProblemField('constraints', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Time Limit (ms)"
                    value={problemForm.timeLimit}
                    onChange={(e) => updateProblemField('timeLimit', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                  />

                  <input
                    type="number"
                    placeholder="Memory Limit (MB)"
                    value={problemForm.memoryLimit}
                    onChange={(e) => updateProblemField('memoryLimit', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                  />

                  <label className={`col-span-2 flex items-center gap-3 rounded-xl border px-4 py-3 ${isDark ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'}`}>
                    <input
                      type="checkbox"
                      checked={problemForm.isActive}
                      onChange={(e) => updateProblemField('isActive', e.target.checked)}
                    />
                    Active problem
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea
                  rows={5}
                  placeholder="Sample Input"
                  value={problemForm.sampleInput}
                  onChange={(e) => updateProblemField('sampleInput', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                />

                <textarea
                  rows={5}
                  placeholder="Sample Output"
                  value={problemForm.sampleOutput}
                  onChange={(e) => updateProblemField('sampleOutput', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Test Cases</h4>
                  <button
                    onClick={addProblemTestCase}
                    className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-950 font-semibold"
                  >
                    + Add Test Case
                  </button>
                </div>

                <div className="space-y-4">
                  {problemForm.testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border p-4 ${isDark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-medium">Test Case #{index + 1}</div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={testCase.isHidden}
                              onChange={(e) => handleProblemTestCaseChange(index, 'isHidden', e.target.checked)}
                            />
                            Hidden
                          </label>
                          <button
                            onClick={() => removeProblemTestCase(index)}
                            disabled={problemForm.testCases.length <= 1}
                            className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <textarea
                          rows={5}
                          value={testCase.input}
                          onChange={(e) => handleProblemTestCaseChange(index, 'input', e.target.value)}
                          className={`w-full rounded-xl border px-4 py-3 font-mono ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                        />
                        <textarea
                          rows={5}
                          value={testCase.output}
                          onChange={(e) => handleProblemTestCaseChange(index, 'output', e.target.value)}
                          className={`w-full rounded-xl border px-4 py-3 font-mono ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <button
                onClick={resetProblemModal}
                className={`px-5 py-2.5 rounded-xl border ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProblem}
                disabled={problemActionLoading}
                className="px-5 py-2.5 rounded-xl bg-green-500 text-white hover:bg-green-400 transition disabled:opacity-60"
              >
                {problemActionLoading
                  ? problemFormMode === 'edit'
                    ? 'Updating...'
                    : 'Saving...'
                  : problemFormMode === 'edit'
                    ? 'Update Problem'
                    : 'Create Problem'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateContestModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingContestId ? 'Edit Contest' : 'Create New Contest'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Contest Title"
                value={contestForm.title}
                onChange={(e) => setContestForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <select
                value={contestForm.difficulty}
                onChange={(e) => setContestForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {contestDifficultyOptions.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>

              <input
                type="datetime-local"
                value={contestForm.startTime}
                onChange={(e) => setContestForm((prev) => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                min="1"
                placeholder="Duration in minutes"
                value={contestForm.duration}
                onChange={(e) => setContestForm((prev) => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />

              <input
                type="number"
                min="1"
                placeholder="Max participants (optional)"
                value={contestForm.maxParticipants}
                onChange={(e) => setContestForm((prev) => ({ ...prev, maxParticipants: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />

              <label className="flex items-center gap-3 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={contestForm.isPublic}
                  onChange={(e) => setContestForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
                />
                Public contest
              </label>
            </div>

            <textarea
              placeholder="Contest description"
              value={contestForm.description}
              onChange={(e) => setContestForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full mb-4 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />

            <div className="mb-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Select Problems</h4>
                <input
                  type="text"
                  value={contestProblemSearch}
                  onChange={(e) => setContestProblemSearch(e.target.value)}
                  placeholder="Search problems"
                  className="w-full max-w-xs px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                Selected {contestForm.problemIds.length} problem{contestForm.problemIds.length !== 1 ? 's' : ''}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredContestProblemOptions.map((problem) => (
                  <label
                    key={problem.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={contestForm.problemIds.includes(problem.id)}
                      onChange={() => handleContestProblemToggle(problem.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{problem.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {problem.difficulty} • {problem.topic} • {problem.submissions} submissions
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={resetContestModal}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContest}
                disabled={contestActionLoading}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-60"
              >
                {contestActionLoading ? 'Saving...' : editingContestId ? 'Update Contest' : 'Create Contest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;