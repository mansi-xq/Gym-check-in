import React from 'react';
import { Users, Flame, Target } from 'lucide-react';
import { FriendProgress } from '../types';

interface FriendsProgressProps {
  friends: FriendProgress[];
  isLoading: boolean;
}

export const FriendsProgress: React.FC<FriendsProgressProps> = ({ friends, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Friends Progress</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg text-center">
        <Users size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Friends Yet</h3>
        <p className="text-gray-600 text-sm">
          Add friends to see their progress and stay motivated together!
        </p>
      </div>
    );
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-orange-600';
    if (streak >= 7) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatLastCheckin = (date: string | null) => {
    if (!date) return 'Never';
    
    const checkinDate = new Date(date);
    const today = new Date();
    const diffTime = today.getTime() - checkinDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Friends Progress</h3>
      </div>

      <div className="space-y-4">
        {friends.map((friend) => (
          <div key={friend.user_id} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">{friend.name}</h4>
              <span className="text-xs text-gray-500">
                {formatLastCheckin(friend.last_checkin)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Current Streak */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame size={16} className={getStreakColor(friend.current_streak)} />
                  <span className="text-xs text-gray-600">Streak</span>
                </div>
                <div className={`text-lg font-bold ${getStreakColor(friend.current_streak)}`}>
                  {friend.current_streak}
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target size={16} className="text-blue-600" />
                  <span className="text-xs text-gray-600">This Week</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {friend.this_week_checkins}/{friend.weekly_goal}
                </div>
              </div>
            </div>

            {/* Weekly Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((friend.this_week_checkins / friend.weekly_goal) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};