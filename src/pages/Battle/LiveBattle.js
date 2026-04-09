import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function LiveBattle() {
  const navigate = useNavigate();
  const { battleId } = useParams();
  const { isDark } = useTheme();
  const editorRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const [code, setCode] = useState(`// Battle Mode!\nfunction solution(arr, target) {\n  // Solve faster than your opponent!\n  return [];\n}`);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [battleLoading, setBattleLoading] = useState(true);
  const [problem, setProblem] = useState(null);
  
  // Battle states
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [battleStatus, setBattleStatus] = useState('active'); // active, won, lost, draw
  const [opponent, setOpponent] = useState({
    name: 'Opponent',
    avatar: 'O',
    progress: 0,
    status: 'coding', // coding, submitted, won
    lastSubmission: null
  });
  const [myProgress, setMyProgress] = useState(0);
  const [battleLog, setBattleLog] = useState([
    { time: new Date().toLocaleTimeString(), message: 'Battle started!', type: 'info' }
  ]);

  // Fetch random problem for the battle
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setBattleLoading(true);
        const response = await fetch('http://localhost:5001/api/problems/random/battle?difficulty=Medium');
        const data = await response.json();
        
        if (data.problem) {
          setProblem({
            id: data.problem._id,
            title: data.problem.title,
            difficulty: data.problem.difficulty,
            description: data.problem.description,
            examples: data.problem.examples || [],
            constraints: data.problem.constraints || [],
            category: data.problem.category
          });
          
          // Add log message
          setBattleLog(prev => [
            ...prev,
            { time: new Date().toLocaleTimeString(), message: `Problem loaded: ${data.problem.title}`, type: 'info' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching battle problem:', error);
        // Fallback to a sample problem
        setProblem({
          id: 'sample',
          title: 'Sample Problem',
          difficulty: 'Medium',
          description: 'Solve this problem to win the battle!',
          examples: [],
          constraints: []
        });
      } finally {
        setBattleLoading(false);
      }
    };

    fetchProblem();
  }, [battleId]);

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'cpp', label: 'C++', icon: '🔵' },
    { value: 'java', label: 'Java', icon: '☕' }
  ];

  // Timer effect
  useEffect(() => {
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
  }, []);

  // Simulate opponent progress
  useEffect(() => {
    const interval = setInterval(() => {
      setOpponent((prev) => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 5, 100)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  const handleLeaveBattle = () => {
    navigate('/battle');
  };

  const handleRematch = () => {
    const newBattleId = Math.random().toString(36).substring(7);
    navigate(`/battle/${newBattleId}`);
    setBattleStatus('active');
    setOutput(null);
    setBattleLog([{ time: new Date().toLocaleTimeString(), message: 'Battle restarted!', type: 'info' }]);
    setMyProgress(0);
    setOpponent((prev) => ({ ...prev, progress: 0, status: 'coding' }));
  };

  const handleRun = async () => {
    setIsRunning(true);
    setMyProgress((prev) => Math.min(prev + 20, 80));
    
    setTimeout(() => {
      setOutput({
        status: 'success',
        testCases: [
          { id: 1, status: 'passed' },
          { id: 2, status: 'passed' },
          { id: 3, status: 'failed', error: 'Time Limit Exceeded' }
        ],
        passed: 2,
        total: 3
      });
      setBattleLog((prev) => [...prev, { 
        time: new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit'}), 
        message: 'You passed 2/3 test cases', 
        type: 'success' 
      }]);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const won = Math.random() > 0.3; // Simulate win/loss
      setBattleStatus(won ? 'won' : 'lost');
      setOutput({
        status: won ? 'accepted' : 'wrong',
        message: won ? '🎉 You won the battle!' : '❌ Wrong answer on test case 5'
      });
      setBattleLog((prev) => [...prev, { 
        time: new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit'}), 
        message: won ? 'You submitted the correct solution!' : 'Submission failed', 
        type: won ? 'success' : 'error' 
      }]);
      setIsRunning(false);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'coding': return 'text-yellow-400';
      case 'submitted': return 'text-blue-400';
      case 'won': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'coding': return '💻 Coding...';
      case 'submitted': return '⏳ Submitted';
      case 'won': return '✅ Solved!';
      default: return '';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`border-b px-6 py-3 flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
            Code<span className="text-yellow-400">Arena</span>
          </h1>
          <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>|</span>
          <span className="text-red-400 font-bold animate-pulse">● LIVE BATTLE</span>
        </div>
        
        {/* Timer */}
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

      {/* Battle Result Overlay */}
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
              {battleStatus === 'won' ? 'You solved it first! +50 XP' : battleStatus === 'lost' ? 'Opponent was faster! -10 XP' : 'Both solved at the same time!'}
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem */}
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
            {problem.examples.map((ex, idx) => (
              <div key={idx} className={`rounded p-3 text-xs ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}>
                <div className={`mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Example {idx + 1}:</div>
                <div className="text-green-400">Input: {ex.input}</div>
                <div className="text-yellow-400">Output: {ex.output}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Panel - Code Editor */}
        <div className={`w-1/2 flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {/* Editor Header */}
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

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={setCode}
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

          {/* Output Console */}
          {output && (
            <div className={`h-40 overflow-y-auto ${isDark ? 'border-t border-gray-800 bg-gray-950' : 'border-t border-gray-200 bg-gray-50'}`}>
              <div className={`px-4 py-2 border-b font-semibold text-sm flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <span>Output</span>
                {output.passed !== undefined && (
                  <span className={output.passed === output.total ? 'text-green-400' : 'text-yellow-400'}>
                    {output.passed}/{output.total} passed
                  </span>
                )}
              </div>
              <div className="p-4">
                {output.testCases ? (
                  <div className="flex gap-2">
                    {output.testCases.map((tc) => (
                      <div 
                        key={tc.id}
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                          tc.status === 'passed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {tc.status === 'passed' ? '✓' : '✗'}
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

        {/* Right Panel - Battle Info */}
        <div className={`w-1/4 flex flex-col ${isDark ? 'border-l border-gray-800 bg-gray-900' : 'border-l border-gray-200 bg-gray-50'}`}>
          {/* Opponent Card */}
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
            
            {/* Opponent Progress */}
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

          {/* Your Progress */}
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

          {/* Battle Log */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Battle Log</h3>
            <div className="space-y-2">
              {battleLog.map((log, idx) => (
                <div key={idx} className="text-xs">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>[{log.time}]</span>{' '}
                  <span className={
                    log.type === 'success' ? 'text-green-400' : 
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'opponent' ? 'text-red-300' : 'text-gray-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-800 bg-gray-950">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-yellow-400">2</div>
                <div className="text-xs text-gray-500">Tests Passed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">3</div>
                <div className="text-xs text-gray-500">Submissions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveBattle;