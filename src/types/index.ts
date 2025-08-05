export interface CheckIn {
  date: string; // YYYY-MM-DD format
  checkedIn: boolean;
  timestamp?: number;
}

export interface AppSettings {
  reminderTime: string;
  notificationsEnabled: boolean;
  weeklyGoal: number;
}

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  weeklySuccessRate: number;
  thisWeekCheckIns: number;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  created_at: string;
  share_code: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  friend_name: string;
  created_at: string;
  status: 'pending' | 'accepted';
}

export interface FriendProgress {
  user_id: string;
  name: string;
  current_streak: number;
  this_week_checkins: number;
  last_checkin: string | null;
  weekly_goal: number;
}