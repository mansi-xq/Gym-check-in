import { supabase } from '../lib/supabase';
import { CheckIn, AppSettings } from '../types';

export const syncCheckInsToSupabase = async (checkIns: CheckIn[], userId: string) => {
  try {
    // Delete existing check-ins for this user
    await supabase
      .from('checkins')
      .delete()
      .eq('user_id', userId);
    
    // Insert new check-ins
    if (checkIns.length > 0) {
      const supabaseCheckins = checkIns.map(checkIn => ({
        user_id: userId,
        date: checkIn.date,
        checked_in: checkIn.checkedIn
      }));
      
      const { error } = await supabase
        .from('checkins')
        .insert(supabaseCheckins);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Failed to sync check-ins:', error);
    throw error;
  }
};

export const getCheckInsFromSupabase = async (userId: string): Promise<CheckIn[]> => {
  try {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      date: item.date,
      checkedIn: item.checked_in,
      timestamp: new Date(item.created_at).getTime()
    }));
  } catch (error) {
    console.error('Failed to get check-ins:', error);
    return [];
  }
};

export const syncSettingsToSupabase = async (settings: AppSettings, userId: string) => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        reminder_time: settings.reminderTime,
        notifications_enabled: settings.notificationsEnabled,
        weekly_goal: settings.weeklyGoal
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Failed to sync settings:', error);
    throw error;
  }
};

export const getSettingsFromSupabase = async (userId: string): Promise<AppSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return null;
    
    return {
      reminderTime: data.reminder_time,
      notificationsEnabled: data.notifications_enabled,
      weeklyGoal: data.weekly_goal
    };
  } catch (error) {
    console.error('Failed to get settings:', error);
    return null;
  }
};