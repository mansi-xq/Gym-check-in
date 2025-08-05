import { CheckIn, AppSettings } from '../types';

const CHECKINS_KEY = 'gym-checkins';
const SETTINGS_KEY = 'gym-settings';

export const getCheckIns = (): CheckIn[] => {
  try {
    const stored = localStorage.getItem(CHECKINS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCheckIns = (checkIns: CheckIn[]): void => {
  try {
    // Keep only last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const filtered = checkIns.filter(c => 
      new Date(c.date) >= sixtyDaysAgo
    );
    
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to save check-ins:', error);
  }
};

export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {
      reminderTime: '18:00',
      notificationsEnabled: false,
      weeklyGoal: 5
    };
  } catch {
    return {
      reminderTime: '18:00',
      notificationsEnabled: false,
      weeklyGoal: 5
    };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};