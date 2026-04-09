import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const contests = [
  { id: 1, title: 'Weekly Contest 15', description: 'Standard weekly contest with mixed difficulty problems', status: 'upcoming', startTime: new Date(Date.now() + 86400000 * 2), endTime: new Date(Date.now() + 86400000 * 2 + 5400000), duration: 90, participants: 342, maxParticipants: 500, difficulty: 'Mixed' },
  { id: 2, title: 'CSE Intra Department', description: 'Battle for CSE department supremacy!', status: 'ongoing', startTime: new Date(Date.now() - 1800000), endTime: new Date(Date.now() + 5400000), duration: 120, problems: 6, participants: 89, maxParticipants: 200, difficulty: 'Medium-Hard', results: [{ rank: 1, name: 'Rakib Hassan', score: 850, penalty: '18m', solved: 5, ratingChange: '+120', submissions: [] }, { rank: 2, name: 'Sadia Islam', score: 810, penalty: '22m', solved: 4, ratingChange: '+105', submissions: [] }, { rank: 3, name: 'You', score: 720, penalty: '35m', solved: 3, ratingChange: '+85', submissions: [] }], problemsList: [
    { id: 1, title: 'Two Sum', difficulty: 'Easy', solved: true, attempts: 2, time: '15m', code: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n}', complexity: 'O(n)' },
    { id: 2, title: 'Valid Parentheses', difficulty: 'Easy', solved: true, attempts: 1, time: '8m', code: 'function isValid(s) {\n  const stack = [];\n  const map = {\n    ")": "(",\n    "}": "{",\n    "]": "["\n  };\n  for (let char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}', complexity: 'O(n)' },
    { id: 3, title: 'Merge Two Sorted Lists', difficulty: 'Easy', solved: false, attempts: 3, time: '-', code: '', complexity: '-' },
    { id: 4, title: 'Maximum Subarray', difficulty: 'Medium', solved: true, attempts: 4, time: '45m', code: 'function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}', complexity: 'O(n)' },
    { id: 5, title: 'Climbing Stairs', difficulty: 'Easy', solved: true, attempts: 1, time: '12m', code: 'function climbStairs(n) {\n  if (n <= 2) return n;\n  let prev = 1, curr = 2;\n  for (let i = 3; i <= n; i++) {\n    const next = prev + curr;\n    prev = curr;\n    curr = next;\n  }\n  return curr;\n}', complexity: 'O(n)' },
    { id: 6, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', solved: false, attempts: 2, time: '-', code: '', complexity: '-' }
  ] },
  { id: 3, title: 'Beginner Friendly #12', description: 'Perfect for newcomers to competitive programming', status: 'upcoming', startTime: new Date(Date.now() + 86400000 * 5), endTime: new Date(Date.now() + 86400000 * 5 + 3600000), duration: 60, participants: 156, maxParticipants: 1000, difficulty: 'Easy' },
  { id: 4, title: 'New Year Special 2024', description: 'Grand contest to celebrate the new year', status: 'ended', startTime: new Date(Date.now() - 86400000 * 10), endTime: new Date(Date.now() - 86400000 * 10 + 7200000), duration: 120, participants: 567, maxParticipants: 1000, difficulty: 'Hard', myRank: 42, totalParticipants: 567, results: [
    {
      rank: 1,
      name: 'Rakib Hassan',
      score: 950,
      penalty: '12m',
      solved: 8,
      ratingChange: '+156',
      submissions: [
        { problemId: 1, code: 'function solution(arr) {\n  return arr.sort((a,b)=>a-b);\n}', complexity: 'O(n log n)', attempts: 1, time: '8m' },
        { problemId: 2, code: 'function maxProfit(prices) {\n  let min = prices[0], max = 0;\n  for(let price of prices) {\n    min = Math.min(min, price);\n    max = Math.max(max, price - min);\n  }\n  return max;\n}', complexity: 'O(n)', attempts: 2, time: '15m' }
      ]
    },
    {
      rank: 2,
      name: 'Sadia Islam',
      score: 910,
      penalty: '15m',
      solved: 7,
      ratingChange: '+142',
      submissions: []
    },
    {
      rank: 3,
      name: 'Nabil Ahmed',
      score: 880,
      penalty: '18m',
      solved: 7,
      ratingChange: '+138',
      submissions: []
    },
    {
      rank: 42,
      name: 'You',
      score: 620,
      penalty: '45m',
      solved: 5,
      ratingChange: '+89',
      submissions: []
    }
  ] },
  { id: 5, title: 'Algorithm Master', description: 'Advanced algorithms and data structures', status: 'ended', startTime: new Date(Date.now() - 86400000 * 3), endTime: new Date(Date.now() - 86400000 * 3 + 10800000), duration: 180, participants: 234, maxParticipants: 300, difficulty: 'Expert', results: [
    {
      rank: 1,
      name: 'Tanha Begum',
      score: 860,
      penalty: '20m',
      solved: 5,
      ratingChange: '+203',
      submissions: []
    },
    {
      rank: 2,
      name: 'Rifat Hossain',
      score: 840,
      penalty: '22m',
      solved: 5,
      ratingChange: '+189',
      submissions: []
    },
    {
      rank: 3,
      name: 'Rakib Hassan',
      score: 820,
      penalty: '25m',
      solved: 4,
      ratingChange: '+175',
      submissions: []
    }
  ] }
];

function ContestLive() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [showContestLeaderboard, setShowContestLeaderboard] = React.useState(false);

  const contest = contests.find(c => String(c.id) === String(contestId));

  if (!contest) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        <h2 className="text-3xl font-bold">Contest not found</h2>
        <p className="mt-3 text-gray-500">The contest you selected does not exist.</p>
        <button onClick={() => navigate('/contest')} className="mt-4 px-4 py-2 bg-yellow-400 text-gray-950 rounded-lg">Go back to Contests</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <button onClick={() => navigate('/contest')} className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg">← Back to Contests</button>
      <h2 className="text-3xl font-bold">{contest.title}</h2>
      <p className="text-gray-400 mt-2">{contest.description}</p>
      <div className="mt-4 space-y-2 text-sm text-gray-300">
        <div><span className="text-gray-100 font-semibold">Status:</span> {contest.status}</div>
        <div><span className="text-gray-100 font-semibold">Duration:</span> {contest.duration} mins</div>
        <div><span className="text-gray-100 font-semibold">Participants:</span> {contest.participants} / {contest.maxParticipants}</div>
        <div><span className="text-gray-100 font-semibold">Difficulty:</span> {contest.difficulty}</div>
      </div>

      {contest.status === 'ongoing' && contest.problemsList && contest.problemsList.length > 0 && (
        <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Problem Set</h3>
          <div className="space-y-3">
            {contest.problemsList.map((problem) => (
              <div key={problem.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="font-medium">{problem.title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={problem.solved ? 'text-green-400' : 'text-gray-400'}>
                    {problem.solved ? '✓ Solved' : 'Unsolved'}
                  </span>
                  <span className="text-gray-400">Attempts: {problem.attempts}</span>
                  <span className="text-gray-400">Time: {problem.time}</span>
                  <button 
                    onClick={() => navigate(`/problem/${problem.id}`)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    Solve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {contest.status === 'ended' && (
        <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Contest Results</h3>
              {contest.myRank && contest.totalParticipants && (
                <p className="text-sm text-gray-400">Your rank: #{contest.myRank} of {contest.totalParticipants}</p>
              )}
            </div>
            {contest.results && contest.results.length > 0 ? (
              <span className="text-xs uppercase px-2 py-1 rounded-full bg-green-500/10 text-green-300">finished</span>
            ) : (
              <span className="text-xs uppercase px-2 py-1 rounded-full bg-gray-700 text-gray-400">no results</span>
            )}
          </div>

          {contest.results && contest.results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-2 px-3">Rank</th>
                    <th className="py-2 px-3">User</th>
                    <th className="py-2 px-3">Solved</th>
                    <th className="py-2 px-3">Score</th>
                    <th className="py-2 px-3">Penalty</th>
                    <th className="py-2 px-3">Rating Change</th>
                    <th className="py-2 px-3">Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {contest.results.map((row) => (
                    <tr key={row.rank} className={row.name === 'You' ? 'bg-yellow-400/10 text-white' : 'bg-gray-900 text-gray-200'}>
                      <td className="py-2 px-3 font-semibold">#{row.rank}</td>
                      <td className="py-2 px-3">{row.name}</td>
                      <td className="py-2 px-3">{row.solved || 0}</td>
                      <td className="py-2 px-3">{row.score}</td>
                      <td className="py-2 px-3">{row.penalty}</td>
                      <td className={`py-2 px-3 font-semibold ${row.ratingChange?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {row.ratingChange || '0'}
                      </td>
                      <td className="py-2 px-3">
                        {row.submissions && row.submissions.length > 0 ? (
                          <button 
                            onClick={() => setSelectedUser(row)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                          >
                            View Code ({row.submissions.length})
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs">No submissions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">Results are being processed. Please check back in a few minutes.</p>
          )}
        </div>
      )}

      <div className="mt-6">
        <button onClick={() => navigate('/problems')} className="px-4 py-2 bg-yellow-400 text-gray-950 rounded-lg mr-3">Go to Problems</button>
        <button onClick={() => setShowContestLeaderboard(!showContestLeaderboard)} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Leaderboard</button>
      </div>

      {/* Contest Leaderboard Modal */}
      {showContestLeaderboard && contest.results && contest.results.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{contest.title} - Leaderboard</h3>
              <button 
                onClick={() => setShowContestLeaderboard(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Problems Solved</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Penalty</th>
                    <th className="py-3 px-4">Rating Change</th>
                  </tr>
                </thead>
                <tbody>
                  {contest.results.map((row) => (
                    <tr key={row.rank} className={`border-b border-gray-700 ${row.name === 'You' ? 'bg-yellow-400/10' : 'hover:bg-gray-800'}`}>
                      <td className="py-3 px-4 font-semibold">#{row.rank}</td>
                      <td className="py-3 px-4 font-medium">{row.name}</td>
                      <td className="py-3 px-4 text-green-400">{row.solved || 0}</td>
                      <td className="py-3 px-4">{row.score}</td>
                      <td className="py-3 px-4 text-gray-400">{row.penalty}</td>
                      <td className={`py-3 px-4 font-semibold ${row.ratingChange?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {row.ratingChange || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedUser.name}'s Submissions</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {selectedUser.submissions && selectedUser.submissions.map((submission, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Problem #{submission.problemId}</span>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Attempts: {submission.attempts}</span>
                      <span>Time: {submission.time}</span>
                      <span className="text-blue-400">Complexity: {submission.complexity}</span>
                    </div>
                  </div>
                  <pre className="bg-gray-950 p-3 rounded text-sm overflow-x-auto text-gray-300">
                    <code>{submission.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContestLive;