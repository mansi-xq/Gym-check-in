import { CheckIn, Stats } from '../types';
import { isThisWeek, getWeekDates } from './dateUtils';

export const calculateStats = (checkIns: CheckIn[]): Stats => {
  const sortedCheckIns = checkIns
    .filter(c => c.checkedIn)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  let checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const checkIn = checkIns.find(c => c.date === dateStr);
    
    if (checkIn?.checkedIn) {
      currentStreak++;
    } else {
      // If today hasn't been checked in yet, don't break the streak
      if (dateStr === today.toISOString().split('T')[0]) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  
  const allDates = checkIns
    .map(c => c.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  for (const date of allDates) {
    const checkIn = checkIns.find(c => c.date === date);
    if (checkIn?.checkedIn) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // This week's check-ins
  const thisWeekCheckIns = checkIns.filter(c => 
    c.checkedIn && isThisWeek(c.date)
  ).length;

  // Weekly success rate (last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const recentCheckIns = checkIns.filter(c => 
    new Date(c.date) >= fourWeeksAgo && c.checkedIn
  ).length;
  
  const weeklySuccessRate = Math.round((recentCheckIns / 20) * 100); // 20 = 4 weeks * 5 days goal

  return {
    currentStreak,
    longestStreak,
    totalCheckIns: sortedCheckIns.length,
    weeklySuccessRate: Math.min(weeklySuccessRate, 100),
    thisWeekCheckIns
  };
};