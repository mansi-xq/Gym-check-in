import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signInAnonymously = async (name: string, phone?: string) => {
  // Create anonymous user
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  
  if (authError) throw authError;
  
  if (authData.user) {
    // Generate unique share code
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        phone: phone || null,
        share_code: shareCode
      });
    
    if (profileError) throw profileError;
    
    // Create default settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: authData.user.id,
        reminder_time: '18:00',
        notifications_enabled: false,
        weekly_goal: 5
      });
    
    if (settingsError) throw settingsError;
  }
  
  return authData;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const generateShareLink = (shareCode: string) => {
  return `${window.location.origin}?invite=${shareCode}`;
};