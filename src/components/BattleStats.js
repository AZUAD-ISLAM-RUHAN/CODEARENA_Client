import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function BattleStats({ battleData = [] }) {
  const defaultData = [
    { name: 'Statistics', wins: 0, losses: 0 },
  ];

  const data = battleData && battleData.length > 0 ? battleData : defaultData;

  return (
    <div className="h-48 w-full">
      {data.length === 1 && !battleData?.length ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <p>No battle history yet. Start a battle to build your stats!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="wins" name="Wins" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#4ade80" />
            ))}
          </Bar>
          <Bar dataKey="losses" name="Losses" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#f87171" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}

export default BattleStats;