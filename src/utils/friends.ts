import { supabase } from '../lib/supabase';
import { FriendProgress } from '../types';

export const addFriendByCode = async (shareCode: string, currentUserId: string) => {
  // Find user by share code
  const { data: friendUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('share_code', shareCode.toUpperCase())
    .single();
  
  if (findError || !friendUser) {
    throw new Error('Friend not found with this code');
  }
  
  if (friendUser.id === currentUserId) {
    throw new Error('You cannot add yourself as a friend');
  }
  
  // Check if already friends
  const { data: existing } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', currentUserId)
    .eq('friend_id', friendUser.id)
    .single();
  
  if (existing) {
    throw new Error('Already friends with this user');
  }
  
  // Get current user info
  const { data: currentUser } = await supabase
    .from('users')
    .select('name')
    .eq('id', currentUserId)
    .single();
  
  // Add friendship (both directions)
  const { error: error1 } = await supabase
    .from('friends')
    .insert({
      user_id: currentUserId,
      friend_id: friendUser.id,
      friend_name: friendUser.name,
      status: 'accepted'
    });
  
  const { error: error2 } = await supabase
    .from('friends')
    .insert({
      user_id: friendUser.id,
      friend_id: currentUserId,
      friend_name: currentUser?.name || 'Friend',
      status: 'accepted'
    });
  
  if (error1 || error2) {
    throw new Error('Failed to add friend');
  }
  
  return friendUser;
};

export const addFriendByPhone = async (phone: string, currentUserId: string) => {
  // Find user by phone
  const { data: friendUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  
  if (findError || !friendUser) {
    throw new Error('No user found with this phone number');
  }
  
  if (friendUser.id === currentUserId) {
    throw new Error('You cannot add yourself as a friend');
  }
  
  // Check if already friends
  const { data: existing } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', currentUserId)
    .eq('friend_id', friendUser.id)
    .single();
  
  if (existing) {
    throw new Error('Already friends with this user');
  }
  
  // Get current user info
  const { data: currentUser } = await supabase
    .from('users')
    .select('name')
    .eq('id', currentUserId)
    .single();
  
  // Add friendship (both directions)
  const { error: error1 } = await supabase
    .from('friends')
    .insert({
      user_id: currentUserId,
      friend_id: friendUser.id,
      friend_name: friendUser.name,
      status: 'accepted'
    });
  
  const { error: error2 } = await supabase
    .from('friends')
    .insert({
      user_id: friendUser.id,
      friend_id: currentUserId,
      friend_name: currentUser?.name || 'Friend',
      status: 'accepted'
    });
  
  if (error1 || error2) {
    throw new Error('Failed to add friend');
  }
  
  return friendUser;
};

export const getFriends = async (userId: string) => {
  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'accepted');
  
  if (error) throw error;
  return data || [];
};

export const getFriendsProgress = async (userId: string): Promise<FriendProgress[]> => {
  const friends = await getFriends(userId);
  
  if (friends.length === 0) return [];
  
  const friendIds = friends.map(f => f.friend_id);
  
  // Get friends' recent check-ins and settings
  const { data: checkinsData } = await supabase
    .from('checkins')
    .select('user_id, date, checked_in')
    .in('user_id', friendIds)
    .gte('date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .eq('checked_in', true);
  
  const { data: settingsData } = await supabase
    .from('user_settings')
    .select('user_id, weekly_goal')
    .in('user_id', friendIds);
  
  // Calculate progress for each friend
  const progress: FriendProgress[] = friends.map(friend => {
    const friendCheckins = checkinsData?.filter(c => c.user_id === friend.friend_id) || [];
    const friendSettings = settingsData?.find(s => s.user_id === friend.friend_id);
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    let checkDate = new Date(today);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasCheckin = friendCheckins.some(c => c.date === dateStr);
      
      if (hasCheckin) {
        currentStreak++;
      } else {
        if (dateStr === today.toISOString().split('T')[0]) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Calculate this week's check-ins
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const thisWeekCheckins = friendCheckins.filter(c => 
      new Date(c.date) >= startOfWeek
    ).length;
    
    // Get last check-in
    const lastCheckin = friendCheckins.length > 0 
      ? friendCheckins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      : null;
    
    return {
      user_id: friend.friend_id,
      name: friend.friend_name,
      current_streak: currentStreak,
      this_week_checkins: thisWeekCheckins,
      last_checkin: lastCheckin,
      weekly_goal: friendSettings?.weekly_goal || 5
    };
  });
  
  return progress;
};