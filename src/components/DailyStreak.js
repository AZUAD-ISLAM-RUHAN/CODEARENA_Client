import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DailyStreak({ userStreak = 0, goalDays = 30 }) {
  const [currentStreak, setCurrentStreak] = useState(userStreak);
  const [highestStreak, setHighestStreak] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real submission data and calculate streaks
  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!token || !currentUser) return;

        // Fetch user's submissions
        const response = await fetch(`http://localhost:5001/api/submissions/user/${currentUser._id}?limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const userSubmissions = data.submissions || [];
          setSubmissions(userSubmissions);
          
          // Calculate streaks from submission data
          const { current, highest } = calculateStreaks(userSubmissions);
          setCurrentStreak(current);
          setHighestStreak(highest);
        }
      } catch (error) {
        console.error('Error fetching submission data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, []);

  // Calculate current and highest streaks from submission data
  const calculateStreaks = (submissions) => {
    if (!submissions || submissions.length === 0) {
      return { current: 0, highest: 0 };
    }

    // Group submissions by date
    const submissionsByDate = {};
    submissions.forEach(sub => {
      const date = new Date(sub.submittedAt).toDateString();
      submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
    });

    const dates = Object.keys(submissionsByDate).sort((a, b) => new Date(b) - new Date(a));
    let currentStreak = 0;
    let highestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from today backwards)
    const today = new Date().toDateString();
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toDateString();
      if (submissionsByDate[dateStr] && submissionsByDate[dateStr] > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate highest streak from all submission history
    for (let i = 0; i < dates.length; i++) {
      const hasSubmission = submissionsByDate[dates[i]] > 0;
      
      if (hasSubmission) {
        tempStreak++;
        highestStreak = Math.max(highestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { current: currentStreak, highest: highestStreak };
  };

  // Generate calendar for the streak view based on real data
  const generateStreakCalendar = () => {
    const today = new Date();
    const days = [];
    
    // Create 28-day calendar
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toDateString();
      const hasSubmission = submissions.some(sub => 
        new Date(sub.submittedAt).toDateString() === dateStr
      );
      
      days.push({
        date,
        isSolved: hasSubmission,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        dayOfMonth: date.getDate()
      });
    }
    
    return days;
  };

  const calendar = generateStreakCalendar();
  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  const progressPercent = (currentStreak / goalDays) * 100;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 dark:border-yellow-400/20 rounded-xl p-6 flex items-center justify-center"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 dark:border-yellow-400/20 rounded-xl p-6"
    >
      {/* Streak Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔥</div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Current Streak</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStreak} <span className="text-sm font-normal text-gray-500">days</span>
            </h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Highest Streak</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{highestStreak} days</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {currentStreak} of {goalDays} days completed ({Math.round(progressPercent)}%)
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="flex-1 text-xs text-center font-medium text-gray-600 dark:text-gray-400 mb-2">
              {day.substring(0, 1)}
            </div>
          ))}
        </div>
        
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1">
            {week.map((day, dayIdx) => (
              <motion.div
                key={dayIdx}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: weekIdx * 0.05 + dayIdx * 0.02 }}
                className={`flex-1 aspect-square rounded text-xs font-medium flex items-center justify-center cursor-pointer transition ${
                  day.isSolved
                    ? 'bg-yellow-400 text-gray-950 hover:bg-yellow-500'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-600'
                }`}
                title={`${day.dayOfWeek}, ${day.date.toDateString()}`}
              >
                {day.dayOfMonth}
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Streak Tips */}
      <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">💡 Keep your streak alive!</p>
        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <li>✓ Solve at least one problem per day</li>
          <li>✓ Submit your solution to maintain the streak</li>
          <li>✓ 30-day streaks earn special badges</li>
        </ul>
      </div>
    </motion.div>
  );
}
