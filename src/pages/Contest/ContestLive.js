import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

function ContestLive() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState('');

  const currentUser = useMemo(() => {
    try {
      const currentUserRaw = localStorage.getItem('currentUser');
      if (currentUserRaw) return JSON.parse(currentUserRaw);

      const profileRaw = localStorage.getItem('userProfile');
      if (profileRaw) return JSON.parse(profileRaw);

      return null;
    } catch (error) {
      return null;
    }
  }, []);

  const currentUserId = currentUser?._id || currentUser?.id || null;

  const getUiStatus = (status) => {
    if (status === 'scheduled') return 'upcoming';
    if (status === 'ongoing') return 'ongoing';
    return 'ended';
  };

  const formatDateTime = (value) => {
    try {
      return new Date(value).toLocaleString();
    } catch (error) {
      return value;
    }
  };

  const formatDuration = (seconds) => {
    const totalSeconds = Number(seconds || 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }

    return `${minutes}m ${secs}s`;
  };

  const isParticipant = (contestData) => {
    const participants = Array.isArray(contestData?.participants) ? contestData.participants : [];
    return participants.some((participant) => {
      const participantId =
        participant && typeof participant === 'object'
          ? participant._id || participant.userId || participant.id
          : participant;
      return String(participantId) === String(currentUserId);
    });
  };

  const getProblemId = (problem) => {
    if (!problem) return null;
    if (typeof problem === 'object') return problem._id || problem.id || null;
    return problem;
  };

  const getProblemTitle = (problem, index) => {
    if (!problem) return `Problem ${index + 1}`;
    if (typeof problem === 'object') return problem.title || `Problem ${index + 1}`;
    return `Problem ${index + 1}`;
  };

  const getProblemDifficulty = (problem) => {
    if (!problem || typeof problem !== 'object') return 'Unknown';
    return problem.difficulty || 'Unknown';
  };

  const fetchContest = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:5001/api/contests/${contestId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contest');
      }

      setContest(data.contest || null);

      if ((data.contest?.leaderboard || []).length > 0) {
        setLeaderboard(data.contest.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      setError(error.message || 'Failed to fetch contest');
      setContest(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);

      const response = await fetch(`http://localhost:5001/api/contests/${contestId}/leaderboard`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch leaderboard');
      }

      setLeaderboard(data.leaderboard || []);

      if (data.contest) {
        setContest(data.contest);
      }
    } catch (error) {
      console.error('Error fetching contest leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchContest();
  }, [contestId]);

  useEffect(() => {
    if (!contest) return;

    const uiStatus = getUiStatus(contest.status);

    if (uiStatus !== 'ongoing') {
      return;
    }

    const interval = setInterval(() => {
      fetchContest();
    }, 5000);

    return () => clearInterval(interval);
  }, [contestId, contest?.status]);

  useEffect(() => {
    if (!contest) return;

    const uiStatus = getUiStatus(contest.status);

    if (uiStatus === 'ended') {
      fetchLeaderboard();
    }
  }, [contestId, contest?.status]);

  if (loading) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/contest')} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}>← Back to Contests</button>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading contest...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/contest')} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}>← Back to Contests</button>
          <ThemeToggle />
        </div>

        <h2 className="text-3xl font-bold">Contest not found</h2>
        <p className="mt-3 text-gray-500">{error || 'The contest you selected does not exist.'}</p>
      </div>
    );
  }

  const uiStatus = getUiStatus(contest.status);
  const problemList = Array.isArray(contest.problemIds) ? contest.problemIds : [];
  const myRow = leaderboard.find((entry) => {
    const entryUserId =
      entry?.userId && typeof entry.userId === 'object'
        ? entry.userId._id || entry.userId.id
        : entry?.userId;
    return String(entryUserId) === String(currentUserId);
  });

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/contest')} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}>← Back to Contests</button>
        <ThemeToggle />
      </div>

      <div className={`rounded-2xl border p-6 mb-6 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl font-bold">{contest.title}</h2>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                uiStatus === 'upcoming'
                  ? 'text-blue-400 bg-blue-400/10'
                  : uiStatus === 'ongoing'
                  ? 'text-green-400 bg-green-400/10'
                  : 'text-gray-400 bg-gray-400/10'
              }`}>
                {uiStatus.toUpperCase()}
              </span>
            </div>

            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{contest.description}</p>

            <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <div><span className="font-semibold">Start:</span> {formatDateTime(contest.startTime)}</div>
              <div><span className="font-semibold">End:</span> {formatDateTime(contest.endTime)}</div>
              <div><span className="font-semibold">Duration:</span> {contest.duration} mins</div>
              <div><span className="font-semibold">Difficulty:</span> {contest.difficulty}</div>
              <div><span className="font-semibold">Participants:</span> {contest.participantCount || contest.participants?.length || 0}</div>
              <div><span className="font-semibold">Problems:</span> {problemList.length}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {uiStatus === 'ongoing' && (
              <div className="text-right">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Live Contest</div>
                <div className="text-xl font-bold text-green-400">Compete Now</div>
              </div>
            )}

            {uiStatus === 'ended' && myRow && (
              <div className="text-right">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your Result</div>
                <div className="text-xl font-bold text-yellow-400">Rank #{myRow.rank}</div>
                <div className={myRow.ratingChange >= 0 ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                  {myRow.ratingChange >= 0 ? '+' : ''}{myRow.ratingChange} rating
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {uiStatus === 'ongoing' && (
        <div className={`mt-6 p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Problem Set</h3>
            {!isParticipant(contest) && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400">
                Join contest first to submit
              </span>
            )}
          </div>

          {problemList.length === 0 ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No problems found for this contest.</p>
          ) : (
            <div className="space-y-3">
              {problemList.map((problem, index) => {
                const problemId = getProblemId(problem);

                return (
                  <div key={problemId || index} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        getProblemDifficulty(problem) === 'Easy'
                          ? 'bg-green-500/20 text-green-400'
                          : getProblemDifficulty(problem) === 'Medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {getProblemDifficulty(problem)}
                      </span>
                      <span className="font-medium">{getProblemTitle(problem, index)}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/problem/${problemId}?contestId=${contest._id}`)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      Solve
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {uiStatus === 'ended' && (
        <div className="mt-6 space-y-6">
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Contest Problems</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You can view the archived contest problems and your own submissions.
                </p>
              </div>

              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                Read Only
              </span>
            </div>

            {problemList.length === 0 ? (
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No problems found for this contest.</p>
            ) : (
              <div className="space-y-3">
                {problemList.map((problem, index) => {
                  const problemId = getProblemId(problem);

                  return (
                    <div
                      key={problemId || index}
                      className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          getProblemDifficulty(problem) === 'Easy'
                            ? 'bg-green-500/20 text-green-400'
                            : getProblemDifficulty(problem) === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {getProblemDifficulty(problem)}
                        </span>
                        <span className="font-medium">{getProblemTitle(problem, index)}</span>
                      </div>

                      <button
                        onClick={() => navigate(`/problem/${problemId}?contestId=${contest._id}`)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        View Problem
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Contest Leaderboard</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Final standings with rating changes
                </p>
              </div>

              <button
                onClick={fetchLeaderboard}
                disabled={leaderboardLoading}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-950 rounded-lg font-semibold disabled:opacity-50"
              >
                {leaderboardLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No leaderboard data available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Solved</th>
                      <th className="py-3 px-4">Total Time</th>
                      <th className="py-3 px-4">Submissions</th>
                      <th className="py-3 px-4">Old Rating</th>
                      <th className="py-3 px-4">New Rating</th>
                      <th className="py-3 px-4">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row) => {
                      const rowUserId =
                        row?.userId && typeof row.userId === 'object'
                          ? row.userId._id || row.userId.id
                          : row?.userId;

                      const name =
                        row?.userId && typeof row.userId === 'object'
                          ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() || row.userId.username
                          : 'Unknown';

                      const isMe = String(rowUserId) === String(currentUserId);

                      return (
                        <tr
                          key={`${row.rank}-${rowUserId}`}
                          className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} ${
                            isMe ? 'bg-yellow-400/10' : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-4 font-semibold">#{row.rank}</td>
                          <td className="py-3 px-4 font-medium">{name}</td>
                          <td className="py-3 px-4 text-green-400">{row.solvedProblems || 0}</td>
                          <td className="py-3 px-4">{formatDuration(row.totalTime || 0)}</td>
                          <td className="py-3 px-4">{row.submissions || 0}</td>
                          <td className="py-3 px-4">{row.oldRating || 1200}</td>
                          <td className="py-3 px-4">{row.newRating || 1200}</td>
                          <td className={`py-3 px-4 font-semibold ${(row.ratingChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(row.ratingChange || 0) >= 0 ? '+' : ''}{row.ratingChange || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button onClick={() => navigate('/problems')} className="px-4 py-2 bg-yellow-400 text-gray-950 rounded-lg mr-3">
          Go to Problems
        </button>
        <button onClick={() => navigate('/leaderboard')} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
          Global Leaderboard
        </button>
      </div>
    </div>
  );
}

export default ContestLive;