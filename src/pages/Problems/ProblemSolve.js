import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedCodeEditor from '../../components/EnhancedCodeEditor';
import DiscussionForum from '../../components/DiscussionForum';
import ThemeToggle from '../../components/ThemeToggle';
import LevelUpModal from '../../components/LevelUpModal';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

function ProblemSolve() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { isDark } = useTheme();

  const searchParams = new URLSearchParams(location.search);
  const contestId = searchParams.get('contestId');

  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [contestInfo, setContestInfo] = useState(null);
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
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [submissionHistoryLoading, setSubmissionHistoryLoading] = useState(false);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);

  const [user, setUser] = useState(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      return currentUser ? JSON.parse(currentUser) : null;
    } catch (error) {
      return null;
    }
  });

  const difficultyColor = {
    Easy: 'text-green-400 bg-green-400/10',
    Medium: 'text-yellow-400 bg-yellow-400/10',
    Hard: 'text-red-400 bg-red-400/10'
  };

  const getProblemXp = (difficulty) => {
    if (difficulty === 'Easy') return 50;
    if (difficulty === 'Medium') return 100;
    if (difficulty === 'Hard') return 200;
    return 50;
  };

  const getProblemTopic = (problemData) => {
    return problemData?.topic || problemData?.category || 'General';
  };

  const getFriendlyVerdict = (status, errorMessage = '') => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'wrong_answer':
        return 'Wrong Answer';
      case 'time_limit_exceeded':
        return 'Time Limit Exceeded';
      case 'runtime_error':
        return 'Runtime Error';
      case 'compilation_error':
        return 'Compilation Error';
      case 'running':
        return 'Running';
      case 'pending':
      default:
        return errorMessage ? 'Submission received' : 'Pending';
    }
  };

  const getVerdictMessage = (verdict) => {
    switch (verdict) {
      case 'Accepted':
        return '✅ All test cases passed!';
      case 'Wrong Answer':
        return '❌ Wrong Answer';
      case 'Time Limit Exceeded':
        return '⏱️ Time Limit Exceeded';
      case 'Runtime Error':
        return '💥 Runtime Error';
      case 'Compilation Error':
        return '⚠️ Compilation Error';
      default:
        return 'Submission processed';
    }
  };

  const hasSolvedProblem = (userData, problemId) => {
    if (!userData?.solvedProblems || !Array.isArray(userData.solvedProblems)) return false;

    return userData.solvedProblems.some((item) => {
      if (typeof item === 'string') return item === problemId;
      if (typeof item === 'object' && item !== null) {
        return String(item._id || item.id || item) === String(problemId);
      }
      return String(item) === String(problemId);
    });
  };

  const formatSubmissionTime = (dateValue) => {
    try {
      return new Date(dateValue).toLocaleString();
    } catch (error) {
      return dateValue;
    }
  };

  const isContestArchived = (contestData) => {
    if (!contestData) return false;
    const status = String(contestData.status || '').toLowerCase();
    return status === 'completed' || status === 'ended';
  };

  const buildTestCasesFromResults = (results = []) => {
    return results.map((result) => ({
      id: result.id,
      input: result.input,
      expected: result.expected,
      got: result.actual,
      status: result.status,
      error: result.error || null,
      errorType: result.errorType || null
    }));
  };

  const buildOutputFromJudge = ({ summary, results = [], mode = 'run', xpChange = 0, newLevelValue = null }) => {
    const verdict = summary?.verdict || 'Unknown';
    const isAccepted = verdict === 'Accepted';

    return {
      status: isAccepted ? (mode === 'submit' ? 'accepted' : 'success') : 'failed',
      verdict,
      message: getVerdictMessage(verdict),
      testCases: buildTestCasesFromResults(results),
      runtime: summary?.executionTime || null,
      memory: summary?.memoryUsage || null,
      passedCount: summary?.passed ?? 0,
      totalCount: summary?.total ?? 0,
      failedTestCase: summary?.failedTestCase || null,
      errorMessage: summary?.errorMessage || null,
      xpChange,
      newLevel: newLevelValue
    };
  };

  const fetchSubmissionHistory = async (token, problemId) => {
    try {
      setSubmissionHistoryLoading(true);

      const query = contestId
        ? `?limit=10&contestId=${encodeURIComponent(contestId)}`
        : '?limit=10';

      const response = await fetch(`${API_BASE}/submissions/problem/${problemId}/me${query}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSubmissionHistory(data.submissions || []);
      } else {
        setSubmissionHistory([]);
      }
    } catch (error) {
      setSubmissionHistory([]);
    } finally {
      setSubmissionHistoryLoading(false);
    }
  };

  useEffect(() => {
    const fetchProblemAndUserData = async () => {
      try {
        setProblemLoading(true);

        const response = await fetch(`${API_BASE}/problems/${id}`);
        const data = await response.json();

        if (data.problem) {
          setProblem(data.problem);

          const token = localStorage.getItem('token');
          if (token) {
            try {
              const profileResp = await fetch(`${API_BASE}/auth/profile`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });

              const profileData = await profileResp.json();

              if (profileResp.ok && profileData.user) {
                setSubmitted(hasSolvedProblem(profileData.user, data.problem._id));
                setUser(profileData.user);
                localStorage.setItem('currentUser', JSON.stringify(profileData.user));
              }

              await fetchSubmissionHistory(token, data.problem._id);
            } catch (error) {
              console.error('Error fetching user/profile data:', error);
            }
          }
        }

        if (contestId) {
          try {
            const contestResponse = await fetch(`${API_BASE}/contests/${contestId}`);
            const contestData = await contestResponse.json();

            if (contestResponse.ok && contestData.contest) {
              setContestInfo(contestData.contest);
            }
          } catch (error) {
            console.error('Error fetching contest info:', error);
          }
        } else {
          setContestInfo(null);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setProblemLoading(false);
      }
    };

    if (id) {
      fetchProblemAndUserData();
    }
  }, [id, contestId]);

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

      const data = await response.json();

      if (!response.ok) {
        setOutput({
          status: 'error',
          message: data.message || 'Code execution failed'
        });
        return;
      }

      setOutput(
        buildOutputFromJudge({
          summary: data.summary,
          results: data.results || [],
          mode: 'run'
        })
      );
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

      if (contestInfo && isContestArchived(contestInfo)) {
        setOutput({
          status: 'error',
          message: 'This contest has already ended. You can view the problem and your own submissions, but contest submission is closed.'
        });
        setIsRunning(false);
        return;
      }

      const previousLevel = user?.level || 1;

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
          ...(contestId ? { contestId } : {})
        })
      });

      const submitData = await submitResponse.json();

      if (!submitResponse.ok) {
        setOutput({
          status: 'error',
          message: submitData.message || 'Submission failed'
        });
        return;
      }

      const xpChange = submitData.xpChange || 0;
      const nextLevel = submitData.userStats?.level || previousLevel;

      if (submitData.userStats) {
        const updatedUser = {
          ...(user || {}),
          ...submitData.userStats
        };

        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        if (nextLevel > previousLevel) {
          setNewLevel(nextLevel);
          setShowLevelUp(true);
        }
      }

      if (xpChange !== 0) {
        setXpNotification({ xp: xpChange });
        setTimeout(() => setXpNotification(null), 3000);
      }

      setOutput(
        buildOutputFromJudge({
          summary: submitData.summary,
          results: submitData.results || [],
          mode: 'submit',
          xpChange,
          newLevelValue: nextLevel
        })
      );

      if (submitData.summary?.verdict === 'Accepted') {
        setSubmitted(true);
      }

      await fetchSubmissionHistory(token, problem._id);
    } catch (error) {
      setOutput({
        status: 'error',
        message: 'Network error. Please try again.'
      });
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

  const handleLoadSubmissionCode = (submission) => {
    setLanguage(submission.language || 'javascript');
    setCode(submission.code || '');
    setIsFullScreen(false);
  };

  if (!problem) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        <div className="text-center">
          {problemLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold">Loading...</h1>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">Problem not found</h1>
              <button
                onClick={() => navigate('/problems')}
                className="mt-4 px-5 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const contestArchived = isContestArchived(contestInfo);

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <LevelUpModal isOpen={showLevelUp} level={newLevel} onClose={() => setShowLevelUp(false)} />

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
            {submitted && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-green-400 bg-green-400/10">
                Solved
              </span>
            )}
            {contestInfo && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                contestArchived
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-blue-400 bg-blue-400/10'
              }`}>
                {contestArchived ? 'Contest Archive' : 'Contest Mode'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {xpNotification && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded"
                >
                  {xpNotification.xp > 0 ? `+${xpNotification.xp}` : xpNotification.xp} XP
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => (contestId ? navigate(`/contest/${contestId}`) : navigate('/problems'))}
              className="text-xs transition hover:text-yellow-400"
            >
              ← Back
            </button>
            <button
              onClick={() => navigate('/battle')}
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-semibold px-3 py-1.5 rounded-lg transition text-xs"
            >
              ⚔️ Battle
            </button>
            <ThemeToggle />
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-yellow-400 text-gray-950 font-bold flex items-center justify-center text-xs"
            >
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`w-1/2 flex flex-col border-r transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'} ${isFullScreen ? 'hidden' : 'flex'}`}>
          <div className={`flex border-b transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            {['description', 'submissions', 'discussion'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-xs capitalize transition ${
                  activeTab === tab
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : isDark
                    ? 'text-gray-500 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'description' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {contestInfo && (
                  <div className={`rounded-lg p-4 border ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="text-sm font-semibold text-blue-400">
                      Contest: {contestInfo.title}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {contestArchived
                        ? 'This contest has ended. You can view the problem and your own contest submissions here.'
                        : 'This submission will be counted inside the contest.'}
                    </div>
                  </div>
                )}

                <div>
                  <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                      {getProblemTopic(problem)}
                    </span>
                    <span className="text-yellow-400 text-sm font-medium">+{getProblemXp(problem.difficulty)} XP</span>
                  </div>
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {problem.description}
                  </p>
                </div>

                <div className={`rounded-lg p-4 border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-300'}`}>
                  <div className="text-xs font-semibold mb-2 text-gray-500">Example 1:</div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex gap-2">
                      <span className="text-gray-500">Input:</span>
                      <code className="text-green-400">{problem.sampleInput}</code>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500">Output:</span>
                      <code className="text-yellow-400">{problem.sampleOutput}</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Constraints:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono text-gray-500">
                    {problem.constraints &&
                      (Array.isArray(problem.constraints) ? problem.constraints : problem.constraints.split('\n')).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'submissions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {contestId ? 'My Contest Submissions' : 'My Recent Submissions'}
                  </h3>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      if (token && problem?._id) {
                        await fetchSubmissionHistory(token, problem._id);
                      }
                    }}
                    className="text-xs text-yellow-400 hover:text-yellow-300 transition"
                  >
                    Refresh
                  </button>
                </div>

                {submissionHistoryLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                    Loading submissions...
                  </div>
                ) : submissionHistory.length === 0 ? (
                  <div className={`rounded-lg p-4 border text-sm ${isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'}`}>
                    No submissions yet for this problem.
                  </div>
                ) : (
                  submissionHistory.map((submission) => {
                    const isExpanded = expandedSubmissionId === submission._id;

                    return (
                      <div
                        key={submission._id}
                        className={`rounded-lg p-4 border ${
                          submission.status === 'accepted'
                            ? 'text-green-400 bg-green-400/10 border-green-700'
                            : submission.status === 'wrong_answer'
                            ? 'text-red-400 bg-red-400/10 border-red-700'
                            : submission.status === 'time_limit_exceeded'
                            ? 'text-orange-400 bg-orange-400/10 border-orange-700'
                            : submission.status === 'runtime_error'
                            ? 'text-pink-400 bg-pink-400/10 border-pink-700'
                            : submission.status === 'compilation_error'
                            ? 'text-yellow-400 bg-yellow-400/10 border-yellow-700'
                            : 'text-blue-400 bg-blue-400/10 border-blue-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-sm">
                              {getFriendlyVerdict(submission.status, submission.errorMessage)}
                            </div>
                            <div className="mt-1 text-[10px] opacity-80">
                              {formatSubmissionTime(submission.submittedAt)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <button
                              onClick={() => setExpandedSubmissionId(isExpanded ? null : submission._id)}
                              className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                                isDark
                                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                                  : 'bg-white text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              {isExpanded ? 'Hide Code' : 'View Code'}
                            </button>

                            <button
                              onClick={() => handleLoadSubmissionCode(submission)}
                              className="px-2 py-1 rounded text-[10px] font-semibold transition bg-yellow-400 text-gray-950 hover:bg-yellow-300"
                            >
                              Load in Editor
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] opacity-90">
                          <div>Language: {submission.language}</div>
                          <div>Passed: {submission.testCasesPassed ?? 0}/{submission.totalTestCases ?? 0}</div>
                          <div>Time: {submission.executionTime ?? 0} ms</div>
                          <div>Memory: {submission.memoryUsed ?? 0} KB</div>
                        </div>

                        {submission.failedTestCase && (
                          <div className="mt-3 text-[11px] opacity-90">
                            <div>Failed Case #{submission.failedTestCase.id}</div>
                            <div className="mt-1">Expected: {submission.failedTestCase.expected}</div>
                            <div>Got: {submission.failedTestCase.actual}</div>
                          </div>
                        )}

                        {submission.errorMessage && (
                          <div className="mt-3 text-[11px] whitespace-pre-wrap opacity-90">
                            {submission.errorMessage}
                          </div>
                        )}

                        {isExpanded && (
                          <div className={`mt-3 rounded-lg border overflow-hidden ${isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-300 bg-white'}`}>
                            <div className={`px-3 py-2 text-[10px] font-semibold border-b ${isDark ? 'border-gray-800 text-gray-400 bg-gray-900' : 'border-gray-300 text-gray-600 bg-gray-100'}`}>
                              Submitted Code
                            </div>
                            <div className="max-h-72 overflow-auto">
                              <pre className={`p-3 text-xs whitespace-pre font-mono ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {submission.code || '// No code found'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {activeTab === 'discussion' && <DiscussionForum problemId={id} />}
          </div>
        </div>

        <div className={`flex flex-col transition-all duration-300 ${isFullScreen ? 'w-full' : 'w-1/2'}`}>
          <div className={`flex items-center justify-end px-4 py-2 border-b shrink-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-1.5 rounded-lg transition text-xs disabled:opacity-50"
              >
                {isRunning ? 'Running...' : '▶️ Run'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isRunning || (contestInfo && contestArchived)}
                className="bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-1.5 rounded-lg transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning
                  ? 'Submitting...'
                  : contestInfo && contestArchived
                  ? 'Contest Ended'
                  : contestId
                  ? '🏆 Submit in Contest'
                  : '✅ Submit'}
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

          {!isFullScreen && output && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`h-56 border-t shrink-0 ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-100 border-gray-200'} overflow-y-auto`}
            >
              <div className="px-4 py-2 border-b flex items-center justify-between sticky top-0 bg-inherit">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[10px] uppercase text-gray-500">Console</span>
                  {output.verdict && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        output.verdict === 'Accepted'
                          ? 'text-green-400 bg-green-400/10'
                          : output.verdict === 'Wrong Answer'
                          ? 'text-red-400 bg-red-400/10'
                          : output.verdict === 'Compilation Error'
                          ? 'text-yellow-400 bg-yellow-400/10'
                          : output.verdict === 'Runtime Error'
                          ? 'text-pink-400 bg-pink-400/10'
                          : output.verdict === 'Time Limit Exceeded'
                          ? 'text-orange-400 bg-orange-400/10'
                          : 'text-blue-400 bg-blue-400/10'
                      }`}
                    >
                      {output.verdict}
                    </span>
                  )}
                </div>

                {output.runtime && output.memory && (
                  <span className="text-[10px] text-gray-500">
                    ⏱️ {output.runtime} | 💾 {output.memory}
                  </span>
                )}
              </div>

              <div className="p-4 text-xs">
                {output.status === 'error' ? (
                  <div className="text-red-400 font-bold">{output.message}</div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`font-bold ${
                        output.verdict === 'Accepted'
                          ? 'text-green-400'
                          : output.verdict === 'Wrong Answer'
                          ? 'text-red-400'
                          : output.verdict === 'Compilation Error'
                          ? 'text-yellow-400'
                          : output.verdict === 'Runtime Error'
                          ? 'text-pink-400'
                          : output.verdict === 'Time Limit Exceeded'
                          ? 'text-orange-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {output.message}
                    </div>

                    <div className="p-2 bg-blue-900/20 border border-blue-700 rounded">
                      <span className="text-blue-400">
                        Passed: {output.passedCount}/{output.totalCount} test cases
                      </span>
                    </div>

                    {output.errorMessage && (
                      <div className="p-2 rounded bg-red-900/20 border border-red-700 text-red-300 whitespace-pre-wrap">
                        {output.errorMessage}
                      </div>
                    )}

                    {output.failedTestCase && (
                      <div className="p-2 rounded bg-red-900/20 border border-red-700 text-red-300">
                        <div className="font-semibold">Failed Test Case #{output.failedTestCase.id}</div>
                        <div className="mt-1 text-[10px]">Input: {output.failedTestCase.input}</div>
                        <div className="text-[10px]">Expected: {output.failedTestCase.expected}</div>
                        <div className="text-[10px]">Got: {output.failedTestCase.actual}</div>
                        {output.failedTestCase.error && (
                          <div className="mt-1 text-[10px] whitespace-pre-wrap">{output.failedTestCase.error}</div>
                        )}
                      </div>
                    )}

                    {output.testCases && output.testCases.length > 0 && (
                      <div className="space-y-2">
                        {output.testCases.map((tc) => (
                          <div
                            key={tc.id}
                            className={`p-2 rounded border ${
                              tc.status === 'passed'
                                ? 'bg-green-900/20 border-green-700 text-green-400'
                                : 'bg-red-900/20 border-red-700 text-red-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={tc.status === 'passed' ? 'text-green-400' : 'text-red-400'}>
                                {tc.status === 'passed' ? '✓' : '✗'} Test Case {tc.id}
                              </span>
                              <span className="text-gray-500">{tc.status}</span>
                            </div>

                            <div className="mt-1 text-[10px] text-gray-400">Input: {tc.input}</div>
                            <div className="text-[10px] text-gray-400">
                              Expected: {tc.expected} | Got: {tc.got}
                            </div>

                            {tc.error && (
                              <div className="mt-1 text-[10px] whitespace-pre-wrap text-red-300">{tc.error}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {output.xpChange !== undefined && output.xpChange !== 0 && (
                      <div className={`font-bold ${output.xpChange > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {output.xpChange > 0 ? `+${output.xpChange}` : output.xpChange} XP
                      </div>
                    )}
                  </div>
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