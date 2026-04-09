import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

function RatingGraph({ ratingHistory = [] }) {
  // Use real data if available, otherwise show placeholder
  const defaultData = [
    { date: 'Now', rating: 1200 },
  ];

  const data = ratingHistory && ratingHistory.length > 0 ? ratingHistory : defaultData;

  return (
    <div className="h-48 w-full">
      {data.length === 1 && !ratingHistory?.length ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <p>No rating history yet. Start solving problems to build your rating!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
          <YAxis domain={[1100, 1600]} stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#facc15' }}
          />
          <Area 
            type="monotone" 
            dataKey="rating" 
            stroke="#facc15" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRating)" 
          />
        </AreaChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}


export default RatingGraph;