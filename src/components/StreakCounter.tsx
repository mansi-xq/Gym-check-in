import React from 'react';
import { Flame, Trophy } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak
}) => {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-orange-600';
    if (streak >= 7) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStreakBg = (streak: number) => {
    if (streak >= 30) return 'bg-purple-100';
    if (streak >= 14) return 'bg-orange-100';
    if (streak >= 7) return 'bg-red-100';
    return 'bg-gray-100';
  };

  return (
    <div className="flex gap-4 w-full">
      <div className={`flex-1 ${getStreakBg(currentStreak)} rounded-xl p-4 text-center`}>
        <div className="flex items-center justify-center mb-2">
          <Flame className={`${getStreakColor(currentStreak)} mr-2`} size={24} />
          <span className="text-sm font-medium text-gray-600">Current Streak</span>
        </div>
        <div className={`text-3xl font-bold ${getStreakColor(currentStreak)}`}>
          {currentStreak}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {currentStreak === 1 ? 'day' : 'days'}
        </div>
      </div>

      <div className="flex-1 bg-yellow-100 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <Trophy className="text-yellow-600 mr-2" size={24} />
          <span className="text-sm font-medium text-gray-600">Best Streak</span>
        </div>
        <div className="text-3xl font-bold text-yellow-600">
          {longestStreak}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {longestStreak === 1 ? 'day' : 'days'}
        </div>
      </div>
    </div>
  );
};