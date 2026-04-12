import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function LiveBattle() {
  const navigate = useNavigate();
  const { battleId } = useParams();
  const { isDark } = useTheme();
  const editorRef = useRef(null);
  const profileFetchedRef = useRef(false);

  const [code, setCode] = useState(`// Battle Mode!\nfunction solution(arr, target) {\n  // Solve faster than your opponent!\n  return [];\n}`);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [battleLoading, setBattleLoading] = useState(true);
  const [battle, setBattle] = useState(null);
  const [problem, setProblem] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      return currentUser ? JSON.parse(currentUser) : null;
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  });

  const [timeLeft, setTimeLeft] = useState(1800);
  const [battleStatus, setBattleStatus] = useState('active');
  const [opponent, setOpponent] = useState({
    name: 'Opponent',
    avatar: 'O',
    progress: 0,
    status: 'coding',
    lastSubmission: null
  });
  const [myProgress, setMyProgress] = useState(0);
  const [battleLog, setBattleLog] = useState([
    { time: new Date().toLocaleTimeString(), message: 'Battle started!', type: 'info' }
  ]);

  const currentUserId = user?._id || user?.id;

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'cpp', label: 'C++', icon: '🔵' },
    { value: 'java', label: 'Java', icon: '☕' }
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  const getBattlePlayers = (battleData) => {
    if (Array.isArray(battleData?.participants)) return battleData.participants;
    if (Array.isArray(battleData?.players)) return battleData.players;
    return [];
  };

  const getPlayerId = (player) => {
    if (!player) return null;

    if (player.userId && typeof player.userId === 'object') return player.userId._id;
    if (player.userId) return player.userId;

    if (player.user && typeof player.user === 'object') return player.user._id;
    if (player.user) return player.user;

    return null;
  };

  const getPlayerUsername = (player) => {
    if (!player) return '';
    if (player.userId && typeof player.userId === 'object') {
      return player.userId.username || player.username || '';
    }
    if (player.user && typeof player.user === 'object') {
      return player.user.username || player.username || '';
    }
    return player.username || '';
  };

  const getPlayerName = (player, fallback = 'Player') => {
    if (!player) return fallback;

    if (player.userId && typeof player.userId === 'object') {
      return (
        player.userId.username ||
        player.userId.firstName ||
        player.userId.name ||
        player.username ||
        fallback
      );
    }

    if (player.user && typeof player.user === 'object') {
      return (
        player.user.username ||
        player.user.firstName ||
        player.user.name ||
        player.username ||
        fallback
      );
    }

    return player.username || fallback;
  };

  const getPlayerProgress = (player) => {
    if (!player) return 0;
    if (player.isWinner) return 100;
    if (player.submittedAt) return 70;
    return 0;
  };

  const getPlayerStatus = (player) => {
    if (!player) return 'coding';
    if (player.isWinner) return 'winner';
    if (player.submittedAt) return 'submitted';
    return 'coding';
  };

  const safeReadJson = async (response) => {
    try {
      return await response.json();
    } catch (error) {
      return {};
    }
  };

  const handleLeaveBattle = async () => {
    if (battleStatus !== 'active') {
      navigate('/battle');
      return;
    }

    const confirmLeave = window.confirm(
      'Are you sure you want to end this battle? You will lose the battle.'
    );

    if (!confirmLeave) return;

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/battles/${battleId}/end`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await safeReadJson(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to end battle');
      }

      if (data.userStats) {
        const updatedUser = { ...user, ...data.userStats._doc, ...data.userStats };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      setBattleStatus('lost');
      navigate('/battle');
    } catch (error) {
      console.error('Error ending battle:', error);
      alert(error.message || 'Failed to end battle. Please try again.');
    }
  };

  const fetchBattle = async (showLoader = true) => {
    try {
      if (showLoader) {
        setBattleLoading(true);
      }

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let resolvedUser = user;

      if (token && !profileFetchedRef.current) {
        const profileResp = await fetch(`${API_BASE}/auth/profile`, {
          headers
        });
        const profileData = await safeReadJson(profileResp);

        if (profileResp.ok && profileData.user) {
          resolvedUser = profileData.user;
          setUser(profileData.user);
          localStorage.setItem('currentUser', JSON.stringify(profileData.user));
          profileFetchedRef.current = true;
        }
      }

      const resolvedUserId = resolvedUser?._id || resolvedUser?.id;

      const response = await fetch(`${API_BASE}/battles/${battleId}`, {
        headers
      });
      const data = await safeReadJson(response);

      if (!response.ok || !data.battle) {
        throw new Error(data.message || 'Battle not found');
      }

      const nextBattle = data.battle;
      const fetchedProblem = nextBattle.problem;

      setBattle(nextBattle);

      setProblem((prev) => {
        if (
          prev &&
          fetchedProblem &&
          String(prev._id || prev.id) === String(fetchedProblem._id || fetchedProblem.id)
        ) {
          return prev;
        }
        return fetchedProblem;
      });

      const battleTime = (nextBattle.timeLimit || 30) * 60;
      setTimeLeft((prev) => (showLoader ? battleTime : prev));

      if (nextBattle.status === 'completed') {
        const winnerId =
          typeof nextBattle.winner === 'object' && nextBattle.winner !== null
            ? nextBattle.winner._id
            : nextBattle.winner;

        setBattleStatus(String(winnerId) === String(resolvedUserId) ? 'won' : 'lost');
      } else {
        setBattleStatus('active');
      }

      const players = getBattlePlayers(nextBattle);
      const otherPlayer = players.find(
        (p) => String(getPlayerId(p)) !== String(resolvedUserId)
      );

      setOpponent({
        name: getPlayerName(otherPlayer, 'Waiting for Opponent'),
        avatar: getPlayerName(otherPlayer, 'O').charAt(0).toUpperCase(),
        progress: getPlayerProgress(otherPlayer),
        status: getPlayerStatus(otherPlayer),
        lastSubmission: otherPlayer?.submittedAt || null
      });

      if (showLoader && fetchedProblem) {
        setBattleLog((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            message: `Problem loaded: ${fetchedProblem.title}`,
            type: 'info'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching battle:', error);

      if (showLoader) {
        setBattle(null);
        setProblem(null);
      }
    } finally {
      if (showLoader) {
        setBattleLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBattle(true);
  }, [battleId]);

  useEffect(() => {
    if (!battleId || battleStatus !== 'active') return;

    const interval = setInterval(() => {
      fetchBattle(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [battleId, battleStatus]);

  useEffect(() => {
    if (battleStatus !== 'active') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [battleStatus, battleId]);

  const handleRematch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const otherPlayer = getBattlePlayers(battle).find(
        (p) => String(getPlayerId(p)) !== String(currentUserId)
      );

      const currentBattleMode =
        battle?.battleMode ||
        (battle?.invitedBy || battle?.invitedUser ? 'friendly' : battle?.battleType || 'unranked');

      const response = await fetch(`${API_BASE}/battles/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(
          currentBattleMode === 'friendly'
            ? {
                opponentUsername: getPlayerUsername(otherPlayer),
                battleMode: 'friendly'
              }
            : {
                battleMode: currentBattleMode,
                battleType: currentBattleMode
              }
        )
      });

      const data = await safeReadJson(response);

      if (!response.ok || !data.battle?._id) {
        return;
      }

      navigate(`/battle/${data.battle._id}`);
      window.location.reload();
    } catch (error) {
      console.error('Rematch error:', error);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setOutput({ status: 'error', message: 'Please login to run code' });
        setIsRunning(false);
        return;
      }

      const response = await fetch(`${API_BASE}/execute/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language,
          problemId: problem._id
        })
      });

      const data = await safeReadJson(response);

      if (!response.ok) {
        setOutput({
          status: 'error',
          message: data.message || 'Code execution failed'
        });
        return;
      }

      const passed = data.summary?.passed || 0;
      const total = data.summary?.total || 0;
      const progress = total > 0 ? Math.round((passed / total) * 100) : 0;
      const verdict = data.summary?.verdict || 'Unknown';

      setMyProgress(progress);

      setOutput({
        status: verdict === 'Accepted' ? 'success' : 'failed',
        verdict,
        testCases: (data.results || []).map((result) => ({
          id: result.id,
          input: result.input,
          expected: result.expected,
          got: result.actual,
          status: result.status,
          error: result.error || null
        })),
        runtime: data.summary?.executionTime,
        memory: data.summary?.memoryUsage,
        passedCount: passed,
        totalCount: total,
        message:
          verdict === 'Accepted'
            ? '✅ All test cases passed!'
            : verdict === 'Wrong Answer'
              ? '❌ Wrong Answer'
              : verdict === 'Compilation Error'
                ? '⚠️ Compilation Error'
                : verdict === 'Runtime Error'
                  ? '💥 Runtime Error'
                  : verdict === 'Time Limit Exceeded'
                    ? '⏱️ Time Limit Exceeded'
                    : 'Run completed'
      });

      setBattleLog((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          message:
            verdict === 'Accepted'
              ? `You passed ${passed}/${total} test cases`
              : `Run result: ${verdict} (${passed}/${total})`,
          type: verdict === 'Accepted' ? 'success' : 'info'
        }
      ]);
    } catch (error) {
      setOutput({
        status: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setOutput({ status: 'error', message: 'Please login to submit' });
        setIsRunning(false);
        return;
      }

      const runResponse = await fetch(`${API_BASE}/execute/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language,
          problemId: problem._id
        })
      });

      const runData = await safeReadJson(runResponse);

      if (!runResponse.ok) {
        setOutput({
          status: 'error',
          message: runData.message || 'Code execution failed'
        });
        setIsRunning(false);
        return;
      }

      const verdict = runData.summary?.verdict || 'Unknown';
      const allPassed = verdict === 'Accepted';
      const isAccepted = allPassed;

      const submitResponse = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problem._id,
          code,
          language,
          isAccepted
        })
      });

      const submitData = await safeReadJson(submitResponse);

      if (!submitResponse.ok) {
        setOutput({
          status: 'error',
          message: submitData.message || 'Submission failed'
        });
        setIsRunning(false);
        return;
      }

      const battleSubmitResponse = await fetch(`${API_BASE}/battles/${battleId}/submit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language,
          isAccepted,
          executionTime: runData.summary?.executionTime || null
        })
      });

      const battleSubmitData = await safeReadJson(battleSubmitResponse);

      if (battleSubmitResponse.ok && battleSubmitData.battle) {
        setBattle(battleSubmitData.battle);

        const winnerId =
          typeof battleSubmitData.battle.winner === 'object' && battleSubmitData.battle.winner !== null
            ? battleSubmitData.battle.winner._id
            : battleSubmitData.battle.winner;

        if (battleSubmitData.battle.status === 'completed') {
          setBattleStatus(String(winnerId) === String(currentUserId) ? 'won' : 'lost');
        }

        const otherPlayer = getBattlePlayers(battleSubmitData.battle).find(
          (p) => String(getPlayerId(p)) !== String(currentUserId)
        );

        setOpponent({
          name: getPlayerName(otherPlayer, 'Waiting for Opponent'),
          avatar: getPlayerName(otherPlayer, 'O').charAt(0).toUpperCase(),
          progress: getPlayerProgress(otherPlayer),
          status: getPlayerStatus(otherPlayer),
          lastSubmission: otherPlayer?.submittedAt || null
        });
      }

      if (battleSubmitData.userStats) {
        const updatedUser = { ...user, ...battleSubmitData.userStats._doc, ...battleSubmitData.userStats };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      } else if (submitData.userStats) {
        const updatedUser = { ...user, ...submitData.userStats };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      const passed = runData.summary?.passed || 0;
      const total = runData.summary?.total || 0;
      const progress = total > 0 ? Math.round((passed / total) * 100) : 0;

      setMyProgress(progress);

      setOutput({
        status: isAccepted ? 'accepted' : 'failed',
        verdict,
        message:
          verdict === 'Accepted'
            ? '✅ All test cases passed!'
            : verdict === 'Wrong Answer'
              ? '❌ Wrong Answer'
              : verdict === 'Compilation Error'
                ? '⚠️ Compilation Error'
                : verdict === 'Runtime Error'
                  ? '💥 Runtime Error'
                  : verdict === 'Time Limit Exceeded'
                    ? '⏱️ Time Limit Exceeded'
                    : 'Submission processed',
        testCases: (runData.results || []).map((result) => ({
          id: result.id,
          input: result.input,
          expected: result.expected,
          got: result.actual,
          status: result.status,
          error: result.error || null
        })),
        runtime: runData.summary?.executionTime,
        memory: runData.summary?.memoryUsage,
        passedCount: passed,
        totalCount: total,
        xpChange: submitData.xpChange,
        newLevel: battleSubmitData.userStats?.level || submitData.userStats?.level
      });

      setBattleLog((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          message:
            verdict === 'Accepted'
              ? 'You submitted the correct solution!'
              : `Submission result: ${verdict}`,
          type: verdict === 'Accepted' ? 'success' : 'error'
        }
      ]);
    } catch (error) {
      setOutput({
        status: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'coding':
        return 'text-yellow-400';
      case 'submitted':
        return 'text-blue-400';
      case 'winner':
      case 'won':
        return 'text-green-400';
      case 'loser':
      case 'lost':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'coding':
        return '💻 Coding...';
      case 'submitted':
        return '⏳ Submitted';
      case 'winner':
      case 'won':
        return '✅ Solved!';
      case 'loser':
      case 'lost':
        return '❌ Lost';
      default:
        return '';
    }
  };

  if (battleLoading || !problem) {
    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        <nav className={`border-b px-6 py-3 flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
              Code<span className="text-yellow-400">Arena</span>
            </h1>
            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>|</span>
            <span className="text-red-400 font-bold animate-pulse">● LIVE BATTLE</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-2xl font-mono font-bold text-yellow-400">
              ⏱️ {formatTime(timeLeft)}
            </div>
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLeaveBattle}
              className={`transition-colors text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Leave Battle
            </button>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading battle...</p>
          </div>
        </div>
      </div>
    );
  }

  const examples =
    problem.examples && problem.examples.length > 0
      ? problem.examples
      : (
          problem.sampleInput || problem.sampleOutput
            ? [{ input: problem.sampleInput || '', output: problem.sampleOutput || '' }]
            : []
        );

  const constraints = Array.isArray(problem.constraints)
    ? problem.constraints
    : (problem.constraints ? String(problem.constraints).split('\n') : []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <nav className={`border-b px-6 py-3 flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
            Code<span className="text-yellow-400">Arena</span>
          </h1>
          <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>|</span>
          <span className="text-red-400 font-bold animate-pulse">● LIVE BATTLE</span>
        </div>

        <div className="flex items-center gap-6">
          <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLeaveBattle}
            className={`transition-colors text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Leave Battle
          </button>
        </div>
      </nav>

      {battleStatus !== 'active' && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${isDark ? 'bg-black/80' : 'bg-black/60'}`}>
          <div className={`border-2 border-yellow-400 rounded-2xl p-8 text-center max-w-md ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="text-6xl mb-4">
              {battleStatus === 'won' ? '🏆' : battleStatus === 'lost' ? '💀' : '🤝'}
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${battleStatus === 'won' ? 'text-green-400' : battleStatus === 'lost' ? 'text-red-400' : 'text-yellow-400'}`}>
              {battleStatus === 'won' ? 'Victory!' : battleStatus === 'lost' ? 'Defeat!' : 'Draw!'}
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {battleStatus === 'won' ? 'You solved it first!' : battleStatus === 'lost' ? 'Opponent was faster!' : 'Battle ended.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={handleLeaveBattle}
                className={`font-semibold px-6 py-3 rounded-lg transition ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Back to Lobby
              </button>
              <button
                type="button"
                onClick={handleRematch}
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-semibold px-6 py-3 rounded-lg transition"
              >
                Rematch
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className={`w-1/4 overflow-y-auto ${isDark ? 'border-r border-gray-800 bg-gray-900' : 'border-r border-gray-200 bg-gray-50'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{problem.title}</h2>
            <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-1 rounded-full">
              {problem.difficulty}
            </span>
          </div>
          <div className="p-4 space-y-4">
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {problem.description}
            </p>

            {examples.map((ex, idx) => (
              <div key={idx} className={`rounded p-3 text-xs ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}>
                <div className={`mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Example {idx + 1}:</div>
                <div className="text-green-400">Input: {ex.input}</div>
                <div className="text-yellow-400">Output: {ex.output}</div>
              </div>
            ))}

            {constraints.length > 0 && (
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Constraints</h3>
                <ul className={`list-disc list-inside space-y-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {constraints.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className={`w-1/2 flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.icon} {lang.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning}
                className={`font-medium px-4 py-1.5 rounded-lg transition text-sm disabled:opacity-50 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                {isRunning ? '⏳' : '▶️'} Run
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isRunning || battleStatus !== 'active'}
                className="bg-green-500 hover:bg-green-400 text-white font-medium px-4 py-1.5 rounded-lg transition text-sm disabled:opacity-50"
              >
                {isRunning ? '⏳' : '✅'} Submit
              </button>
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
              }}
            />
          </div>

          {output && (
            <div className={`h-48 overflow-y-auto ${isDark ? 'border-t border-gray-800 bg-gray-950' : 'border-t border-gray-200 bg-gray-50'}`}>
              <div className={`px-4 py-2 border-b font-semibold text-sm flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <span>Output</span>
                {output.passedCount !== undefined && output.totalCount !== undefined && (
                  <span className={output.passedCount === output.totalCount ? 'text-green-400' : 'text-yellow-400'}>
                    {output.passedCount}/{output.totalCount} passed
                  </span>
                )}
              </div>
              <div className="p-4 text-xs">
                {output.testCases ? (
                  <div className="space-y-2">
                    {output.testCases.map((tc) => (
                      <div
                        key={tc.id}
                        className={`p-2 rounded border ${tc.status === 'passed' ? 'bg-green-900/20 border-green-700 text-green-400' : 'bg-red-900/20 border-red-700 text-red-400'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={tc.status === 'passed' ? 'text-green-400' : 'text-red-400'}>
                            {tc.status === 'passed' ? '✓' : '✗'} Test Case {tc.id}
                          </span>
                          <span className="text-gray-500">{tc.status}</span>
                        </div>
                        <div className="mt-1 text-[10px] text-gray-400">Input: {tc.input}</div>
                        <div className="text-[10px] text-gray-400">Expected: {tc.expected} | Got: {tc.got}</div>
                        {tc.error && (
                          <div className="mt-1 text-[10px] text-red-300 whitespace-pre-wrap">{tc.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={output.status === 'accepted' ? 'text-green-400' : 'text-red-400'}>
                    {output.message}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`w-1/4 flex flex-col ${isDark ? 'border-l border-gray-800 bg-gray-900' : 'border-l border-gray-200 bg-gray-50'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Opponent</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-xl font-bold">
                {opponent.avatar}
              </div>
              <div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{opponent.name}</div>
                <div className={`text-xs ${getStatusColor(opponent.status)}`}>
                  {getStatusText(opponent.status)}
                </div>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                <span className="text-red-400">{Math.round(opponent.progress)}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${opponent.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your Progress</h3>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Completion</span>
                <span className="text-green-400">{Math.round(myProgress)}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${myProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Battle Log</h3>
            <div className="space-y-2">
              {battleLog.map((log, idx) => (
                <div key={idx} className="text-xs">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>[{log.time}]</span>{' '}
                  <span
                    className={
                      log.type === 'success'
                        ? 'text-green-400'
                        : log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'opponent'
                            ? 'text-red-300'
                            : 'text-gray-300'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-950">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-yellow-400">{output?.passedCount || 0}</div>
                <div className="text-xs text-gray-500">Tests Passed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">{output?.totalCount || 0}</div>
                <div className="text-xs text-gray-500">Total Tests</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveBattle;