import React from 'react';
import { CheckIn } from '../types';
import { getWeekDates, isToday } from '../utils/dateUtils';

interface WeeklyProgressProps {
  checkIns: CheckIn[];
  weeklyGoal: number;
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({
  checkIns,
  weeklyGoal
}) => {
  const weekDates = getWeekDates();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const thisWeekCheckIns = checkIns.filter(c => 
    weekDates.includes(c.date) && c.checkedIn
  ).length;

  const progressPercentage = Math.min((thisWeekCheckIns / weeklyGoal) * 100, 100);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">This Week</h3>
        <span className="text-sm font-medium text-blue-600">
          {thisWeekCheckIns}/{weeklyGoal} days
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0</span>
          <span className="font-medium">
            {Math.round(progressPercentage)}% complete
          </span>
          <span>{weeklyGoal}</span>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, index) => {
          const checkIn = checkIns.find(c => c.date === date);
          const isCheckedIn = checkIn?.checkedIn || false;
          const isTodayDate = isToday(date);
          
          return (
            <div key={date} className="text-center">
              <div className="text-xs font-medium text-gray-600 mb-2">
                {dayNames[index]}
              </div>
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mx-auto
                  ${isCheckedIn 
                    ? 'bg-green-500 text-white' 
                    : isTodayDate 
                      ? 'bg-blue-100 text-blue-600 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-400'
                  }
                `}
              >
                {new Date(date).getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};