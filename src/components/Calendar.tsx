import React from 'react';
import { CheckIn } from '../types';
import { getDaysInRange, isToday } from '../utils/dateUtils';

interface CalendarProps {
  checkIns: CheckIn[];
}

export const Calendar: React.FC<CalendarProps> = ({ checkIns }) => {
  const last60Days = getDaysInRange(60);
  
  const getCheckInForDate = (date: string) => {
    return checkIns.find(c => c.date === date);
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      isFirstOfMonth: date.getDate() === 1
    };
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">60-Day History</h3>
      
      <div className="grid grid-cols-10 gap-1">
        {last60Days.map((date) => {
          const checkIn = getCheckInForDate(date);
          const { day, month, isFirstOfMonth } = formatDateForDisplay(date);
          const isTodayDate = isToday(date);
          
          return (
            <div key={date} className="flex flex-col items-center">
              {isFirstOfMonth && (
                <div className="text-xs text-gray-500 font-medium mb-1 col-span-full">
                  {month}
                </div>
              )}
              <div
                className={`
                  w-6 h-6 rounded text-xs flex items-center justify-center font-medium
                  ${checkIn?.checkedIn
                    ? 'bg-green-500 text-white'
                    : isTodayDate
                      ? 'bg-blue-100 text-blue-600 border border-blue-300'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }
                  transition-colors duration-200
                `}
                title={`${date}${checkIn?.checkedIn ? ' - Checked in' : ''}`}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Gym day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Rest day</span>
        </div>
      </div>
    </div>
  );
};