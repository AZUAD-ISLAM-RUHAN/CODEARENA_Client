import React from 'react';

function AchievementWall({ achievements = [] }) {
  // Fallback achievements template
  const defaultAchievements = [
    { id: 1, name: 'First Blood', description: 'Solve your first problem', icon: '🩸', unlocked: false, rarity: 'common' },
    { id: 2, name: 'Speed Demon', description: 'Solve a problem in under 5 minutes', icon: '⚡', unlocked: false, rarity: 'rare' },
    { id: 3, name: 'Battle Winner', description: 'Win your first 1v1 battle', icon: '⚔️', unlocked: false, rarity: 'common' },
    { id: 4, name: 'Streak Master', description: '7-day solving streak', icon: '🔥', unlocked: false, rarity: 'epic' },
    { id: 5, name: 'Problem Hunter', description: 'Solve 50 problems', icon: '🎯', unlocked: false, rarity: 'rare' },
    { id: 6, name: 'Legendary Coder', description: 'Reach Expert level', icon: '👑', unlocked: false, rarity: 'legendary' },
    { id: 7, name: 'Battle Master', description: 'Win 50 battles', icon: '🏆', unlocked: false, rarity: 'epic' },
    { id: 8, name: 'Perfect Score', description: 'Solve a Hard problem on first try', icon: '💎', unlocked: false, rarity: 'legendary' },
  ];

  const displayAchievements = achievements && achievements.length > 0 ? achievements : defaultAchievements;

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'border-gray-600 bg-gray-800/50',
      rare: 'border-blue-500 bg-blue-500/10',
      epic: 'border-purple-500 bg-purple-500/10',
      legendary: 'border-yellow-400 bg-yellow-400/10',
    };
    return colors[rarity] || colors.common;
  };

  const getRarityText = (rarity) => {
    const colors = {
      common: 'text-gray-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
    };
    return colors[rarity] || 'text-gray-400';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {displayAchievements.map((ach) => (
        <div
          key={ach.id}
          className={`relative p-4 rounded-xl border-2 transition-all ${
            ach.unlocked 
              ? getRarityColor(ach.rarity) 
              : 'border-gray-800 bg-gray-900/50 opacity-50 grayscale'
          }`}
        >
          <div className="text-3xl mb-2">{ach.icon}</div>
          <div className={`font-semibold text-sm mb-1 ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>
            {ach.name}
          </div>
          <div className="text-xs text-gray-500 leading-tight">{ach.description}</div>
          {ach.unlocked && (
            <div className={`text-xs mt-2 font-medium uppercase ${getRarityText(ach.rarity)}`}>
              {ach.rarity}
            </div>
          )}
          {!ach.unlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AchievementWall;