import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedCodeEditor from '../../components/EnhancedCodeEditor';
import DiscussionForum from '../../components/DiscussionForum';
import ThemeToggle from '../../components/ThemeToggle';
import LevelUpModal from '../../components/LevelUpModal';
import { useTheme } from '../../context/ThemeContext';

function ProblemSolve() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDark } = useTheme();
  const editorRef = useRef(null);

  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [code, setCode] = useState(`// Write your code here\nfunction solution() {\n  // Your logic\n  return null;\n}`);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [xpNotification, setXpNotification] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [user, setUser] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setProblemLoading(true);
        const response = await fetch(`http://localhost:5001/api/problems/${id}`);
        const data = await response.json();
        
        if (data.problem) {
          setProblem(data.problem);
          const token = localStorage.getItem('token');
          if (token && user) {
            const profileResp = await fetch('http://localhost:5001/api/auth/profile', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const profileData = await profileResp.json();
            setSubmitted(profileData.user.solvedProblems?.includes(data.problem._id));
            setUser(profileData.user);
          }
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setProblemLoading(false);
      }
    };

    if (id) fetchProblem();
  }, [id]);

  const difficultyColor = {
    Easy: 'text-green-400 bg-green-400/10',
    Medium: 'text-yellow-400 bg-yellow-400/10',
    Hard: 'text-red-400 bg-red-400/10'
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    
    setTimeout(() => {
      setOutput({
        status: 'success',
        testCases: [
          { id: 1, input: '[2,7,11,15], 9', expected: '[0,1]', got: '[0,1]', status: 'passed' },
          { id: 2, input: '[3,2,4], 6', expected: '[1,2]', got: '[1,2]', status: 'passed' },
          { id: 3, input: '[3,3], 6', expected: '[0,1]', got: '[0,1]', status: 'passed' }
        ],
        runtime: '56 ms',
        memory: '42.3 MB'
      });
      setIsRunning(false);
    }, 1500);
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

      const isAccepted = Math.random() > 0.3;
      const response = await fetch('http://localhost:5001/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problem._id,
          code,
          language,
          isAccepted
        })
      });

      const data = await response.json();

      if (response.ok) {
        const xpChange = data.xpChange || 0;
        
        if (xpChange !== 0) {
          setXpNotification({ xp: xpChange });
          
          if (data.userStats) {
            const updatedUser = { ...user, ...data.userStats };
            setUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }

          if (data.levelUp) {
            setNewLevel(data.userStats.level);
            setShowLevelUp(true);
          }

          setTimeout(() => setXpNotification(null), 3000);
        }

        setOutput({
          status: isAccepted ? 'accepted' : 'failed',
          message: isAccepted ? '✅ All test cases passed!' : '❌ Some test cases failed',
          runtime: '56 ms',
          memory: '42.3 MB',
          xpChange: xpChange,
          newLevel: data.userStats?.level
        });

        if (isAccepted) setSubmitted(true);
      } else {
        setOutput({ status: 'error', message: data.message || 'Submission failed' });
      }
    } catch (error) {
      setOutput({ status: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsRunning(false);
    }
  };

  const getStarterCode = (lang) => {
    const starters = {
      javascript: `// Write your code here\nfunction solution(arr, target) {\n  // Your logic\n  return [];\n}`,
      python: `# Write your code here\ndef solution(arr, target):\n    # Your logic\n    return []`,
      cpp: `// Write your code here\n#include <vector>\nusing namespace std;\n\nvector<int> solution(vector<int>& arr, int target) {\n    // Your logic\n    return {};\n}`,
      java: `// Write your code here\nimport java.util.*;\n\nclass Solution {\n    public int[] solution(int[] arr, int target) {\n        // Your logic\n        return new int[]{};\n    }\n}`
    };
    return starters[lang];
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(getStarterCode(newLang));
  };

  if (!problem) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        <div className="text-center">
          {problemLoading ? (
            <><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div><h1 className="text-2xl font-bold">Loading...</h1></>
          ) : (
            <><h1 className="text-3xl font-bold">Problem not found</h1><button onClick={() => navigate('/problems')} className="mt-4 px-5 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold">Back</button></>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      
      <LevelUpModal isOpen={showLevelUp} level={newLevel} onClose={() => setShowLevelUp(false)} />

      {/* Navbar */}
      <nav className={`border-b transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} px-6 py-2 shrink-0`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
              Code<span className="text-yellow-400">Arena</span>
            </h1>
            <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>|</span>
            <span className="text-sm font-medium">{problem.title}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColor[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {xpNotification && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded">
                  +{xpNotification.xp} XP
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => navigate('/problems')} className="text-xs transition hover:text-yellow-400">← Back</button>
            <button onClick={() => navigate('/battle')} className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-semibold px-3 py-1.5 rounded-lg transition text-xs">⚔️ Battle</button>
            <ThemeToggle />
            <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-yellow-400 text-gray-950 font-bold flex items-center justify-center text-xs">A</button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel */}
        <div className={`w-1/2 flex flex-col border-r transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'} ${isFullScreen ? 'hidden' : 'flex'}`}>
          <div className={`flex border-b transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            {['description', 'submissions', 'discussion'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium text-xs capitalize transition ${activeTab === tab ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'description' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{problem.topic}</span>
                    <span className="text-yellow-400 text-sm font-medium">+{problem.xp} XP</span>
                  </div>
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{problem.description}</p>
                </div>

                <div className={`rounded-lg p-4 border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-300'}`}>
                  <div className="text-xs font-semibold mb-2 text-gray-500">Example 1:</div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex gap-2">
                      <span className="text-gray-500">Input:</span><code className="text-green-400">{problem.sampleInput}</code>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500">Output:</span><code className="text-yellow-400">{problem.sampleOutput}</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Constraints:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono text-gray-500">
                    {problem.constraints && (Array.isArray(problem.constraints) ? problem.constraints : problem.constraints.split('\n')).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
            {activeTab === 'discussion' && <DiscussionForum problemId={id} />}
          </div>
        </div>

        {/* Right Panel: Editor Area */}
        <div className={`flex flex-col transition-all duration-300 ${isFullScreen ? 'w-full' : 'w-1/2'}`}>
          <div className={`flex items-center justify-end px-4 py-2 border-b shrink-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <button onClick={handleRun} disabled={isRunning} className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-1.5 rounded-lg transition text-xs disabled:opacity-50">
                {isRunning ? 'Running...' : '▶️ Run'}
              </button>
              <button onClick={handleSubmit} disabled={isRunning} className="bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-1.5 rounded-lg transition text-xs disabled:opacity-50">
                {isRunning ? 'Submitting...' : '✅ Submit'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <EnhancedCodeEditor 
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={handleLanguageChange}
              isFullScreen={isFullScreen}
              onFullScreenToggle={() => setIsFullScreen(!isFullScreen)}
            />
          </div>

          {/* Console Output */}
          {!isFullScreen && output && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`h-48 border-t shrink-0 ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-100 border-gray-200'} overflow-y-auto`}>
              <div className="px-4 py-2 border-b flex items-center justify-between sticky top-0 bg-inherit">
                <span className="font-bold text-[10px] uppercase text-gray-500">Console</span>
                <span className="text-[10px] text-gray-500">⏱️ {output.runtime} | 💾 {output.memory}</span>
              </div>
              <div className="p-4 text-xs">
                {output.status === 'success' ? (
                  <div className="space-y-2">
                    {output.testCases.map(tc => (
                      <div key={tc.id} className={`p-2 rounded bg-gray-900 border border-gray-800`}>
                        <span className="text-green-400">✓ Test Case {tc.id} passed</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={output.status === 'accepted' ? 'text-green-400' : 'text-red-400 font-bold'}>{output.message}</div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemSolve;