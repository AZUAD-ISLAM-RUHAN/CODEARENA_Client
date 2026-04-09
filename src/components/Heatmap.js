import React, { useState, useEffect } from 'react';
import { format, getDay, subDays } from 'date-fns';

function Heatmap({ submissions = [] }) {
  const [realSubmissions, setRealSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real submission data
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5001/api/submissions/user/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Get actual submission dates from API
          const submissionsResponse = await fetch('http://localhost:5001/api/submissions/user/' + JSON.parse(localStorage.getItem('currentUser'))._id + '?limit=1000', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (submissionsResponse.ok) {
            const submissionsData = await submissionsResponse.json();
            setRealSubmissions(submissionsData.submissions || []);
          }
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Generate data based on real submissions
  const generateData = () => {
    const submissionsByDate = {};
    
    // Count submissions by date from real data
    realSubmissions.forEach(submission => {
      const date = new Date(submission.submittedAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      submissionsByDate[dateKey] = (submissionsByDate[dateKey] || 0) + 1;
    });
    
    // Generate last 365 days
    const data = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const solves = submissionsByDate[dateKey] || 0;
      data.push({ date, solves });
    }
    return data;
  };

  const data = generateData();
  
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const getColor = (solves) => {
    if (solves === 0) return 'bg-gray-800 dark:bg-gray-700';
    if (solves === 1) return 'bg-green-900 dark:bg-green-800';
    if (solves === 2) return 'bg-green-700 dark:bg-green-600';
    if (solves === 3) return 'bg-green-500 dark:bg-green-400';
    return 'bg-green-400 dark:bg-green-300';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Group by weeks
  const weeks = [];
  let currentWeek = [];
  data.forEach((day, index) => {
    const dayOfWeek = getDay(day.date);
    if (index === 0) {
      // Pad first week
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null);
      }
    }
    currentWeek.push(day);
    if (dayOfWeek === 6 || index === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        {/* Month labels */}
        <div className="flex gap-1 mb-1 ml-8">
          {months.map((month, idx) => (
            <div key={month} className="text-xs text-gray-500 w-8">{month}</div>
          ))}
        </div>
        
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2">
            {['Mon', 'Wed', 'Fri'].map((day) => (
              <div key={day} className="text-xs text-gray-500 h-3 leading-3">{day}</div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm ${day ? getColor(day.solves) : 'bg-transparent'}`}
                    title={day ? `${format(day.date, 'MMM d, yyyy')}: ${day.solves} submissions` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-800" />
            <div className="w-3 h-3 rounded-sm bg-green-900" />
            <div className="w-3 h-3 rounded-sm bg-green-700" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;