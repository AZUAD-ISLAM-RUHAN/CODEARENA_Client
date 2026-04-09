import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

function SkillRadar({ data = [] }) {
  const defaultData = [
    { subject: 'Array', A: 0, fullMark: 100 },
    { subject: 'DP', A: 0, fullMark: 100 },
    { subject: 'Graph', A: 0, fullMark: 100 },
    { subject: 'Tree', A: 0, fullMark: 100 },
    { subject: 'String', A: 0, fullMark: 100 },
    { subject: 'Math', A: 0, fullMark: 100 },
  ];

  const displayData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="h-64 w-full">
      {!data || data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <p>No skill data yet. Solve problems to build your skills!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={displayData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#facc15"
            strokeWidth={2}
            fill="#facc15"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}

export default SkillRadar;