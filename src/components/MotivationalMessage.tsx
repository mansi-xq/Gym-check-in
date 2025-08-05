import React from 'react';
import { Stats } from '../types';

interface MotivationalMessageProps {
  stats: Stats;
  isCheckedInToday: boolean;
}

export const MotivationalMessage: React.FC<MotivationalMessageProps> = ({
  stats,
  isCheckedInToday
}) => {
  const getMotivationalMessage = (): { message: string; emoji: string; color: string } => {
    if (isCheckedInToday) {
      if (stats.currentStreak >= 30) {
        return { 
          message: "Incredible! You're a gym legend! 🏆", 
          emoji: "🏆", 
          color: "text-purple-600" 
        };
      }
      if (stats.currentStreak >= 14) {
        return { 
          message: "Two weeks strong! You're unstoppable! 🔥", 
          emoji: "🔥", 
          color: "text-orange-600" 
        };
      }
      if (stats.currentStreak >= 7) {
        return { 
          message: "One week streak! Keep the momentum! 💪", 
          emoji: "💪", 
          color: "text-red-600" 
        };
      }
      if (stats.thisWeekCheckIns >= 5) {
        return { 
          message: "Weekly goal smashed! You're amazing! ⭐", 
          emoji: "⭐", 
          color: "text-green-600" 
        };
      }
      return { 
        message: "Great job today! Every workout counts! 👏", 
        emoji: "👏", 
        color: "text-green-600" 
      };
    }

    // Not checked in today
    if (stats.currentStreak >= 7) {
      return { 
        message: "Don't break that amazing streak! 🔥", 
        emoji: "🔥", 
        color: "text-orange-600" 
      };
    }
    if (stats.thisWeekCheckIns >= 3) {
      return { 
        message: "You're doing great this week! Keep going! 💪", 
        emoji: "💪", 
        color: "text-blue-600" 
      };
    }
    if (stats.thisWeekCheckIns >= 1) {
      return { 
        message: "Good start this week! Time for another session! 🚀", 
        emoji: "🚀", 
        color: "text-blue-600" 
      };
    }
    
    return { 
      message: "Ready to crush your goals? Let's go! 💪", 
      emoji: "💪", 
      color: "text-blue-600" 
    };
  };

  const { message, color } = getMotivationalMessage();

  return (
    <div className={`text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50`}>
      <p className={`text-lg font-semibold ${color}`}>
        {message}
      </p>
    </div>
  );
};