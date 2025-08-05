import React, { useState, useEffect } from 'react';
import { BarChart3, Settings as SettingsIcon, Calendar as CalendarIcon, UserPlus } from 'lucide-react';
import { CheckIn, AppSettings, Stats } from './types';
import { CheckInButton } from './components/CheckInButton';
import { StreakCounter } from './components/StreakCounter';
import { WeeklyProgress } from './components/WeeklyProgress';
import { MotivationalMessage } from './components/MotivationalMessage';
import { Calendar } from './components/Calendar';
import { Settings } from './components/Settings';
import { UserSetup } from './components/UserSetup';
import { AddFriend } from './components/AddFriend';
import { FriendsProgress } from './components/FriendsProgress';
import { getCheckIns, saveCheckIns, getSettings, saveSettings } from './utils/storage';
import { syncCheckInsToSupabase, getCheckInsFromSupabase, syncSettingsToSupabase, getSettingsFromSupabase } from './utils/supabaseStorage';
import { signUpWithEmail, getCurrentUser, getUserProfile } from './utils/auth';
import { getFriendsProgress } from './utils/friends';
import { calculateStats } from './utils/statsUtils';
import { formatDate, isToday } from './utils/dateUtils';
import { scheduleReminder } from './utils/notifications';
import { User, FriendProgress } from './types';

type View = 'home' | 'calendar' | 'stats' | 'friends';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    reminderTime: '18:00',
    notificationsEnabled: false,
    weeklyGoal: 5
  });
  const [stats, setStats] = useState<Stats>({
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    weeklySuccessRate: 0,
    thisWeekCheckIns: 0
  });
  const [currentView, setCurrentView] = useState<View>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friends, setFriends] = useState<FriendProgress[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const today = formatDate(new Date());
  const todayCheckIn = checkIns.find(c => c.date === today);
  const isCheckedInToday = todayCheckIn?.checkedIn || false;

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (user && currentView === 'friends') {
      loadFriendsProgress();
    }
  }, [user, currentView]);

  // Check for invite code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (inviteCode && user) {
      // Auto-open add friend modal with the code
      setShowAddFriend(true);
    }
  }, [user]);

  const initializeApp = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        // User exists, load their profile and data
        const profile = await getUserProfile(currentUser.id);
        setUser(profile);
        
        // Load data from Supabase first, fallback to localStorage
        const supabaseCheckIns = await getCheckInsFromSupabase(currentUser.id);
        const supabaseSettings = await getSettingsFromSupabase(currentUser.id);
        
        const finalCheckIns = supabaseCheckIns.length > 0 ? supabaseCheckIns : getCheckIns();
        const finalSettings = supabaseSettings || getSettings();
        
        setCheckIns(finalCheckIns);
        setSettings(finalSettings);
        setStats(calculateStats(finalCheckIns));
        
        // Schedule reminder if notifications are enabled
        if (finalSettings.notificationsEnabled) {
          scheduleReminder(finalSettings.reminderTime);
        }
      } else {
        // No user, load from localStorage for now
        const loadedCheckIns = getCheckIns();
        const loadedSettings = getSettings();
        
        setCheckIns(loadedCheckIns);
        setSettings(loadedSettings);
        setStats(calculateStats(loadedCheckIns));
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Fallback to localStorage
      const loadedCheckIns = getCheckIns();
      const loadedSettings = getSettings();
      
      setCheckIns(loadedCheckIns);
      setSettings(loadedSettings);
      setStats(calculateStats(loadedCheckIns));
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleUserSetup = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => {
    try {
      const authData = await signUpWithEmail(email, password, name, phone);
      if (authData.user) {
        const profile = await getUserProfile(authData.user.id);
        setUser(profile);
  
        // Sync existing localStorage data to Supabase
        const localCheckIns = getCheckIns();
        const localSettings = getSettings();
  
        if (localCheckIns.length > 0) {
          await syncCheckInsToSupabase(localCheckIns, authData.user.id);
        }
  
        await syncSettingsToSupabase(localSettings, authData.user.id);
      }
    } catch (error) {
      console.error('Failed to set up user:', error);
      alert('Failed to set up profile. Please try again.');
    }
  };
  

  const handleCheckIn = async () => {
    const newCheckIn: CheckIn = {
      date: today,
      checkedIn: true,
      timestamp: Date.now()
    };

    const updatedCheckIns = checkIns.filter(c => c.date !== today);
    updatedCheckIns.push(newCheckIn);
    
    setCheckIns(updatedCheckIns);
    saveCheckIns(updatedCheckIns);
    setStats(calculateStats(updatedCheckIns));
    
    // Sync to Supabase if user is logged in
    if (user) {
      try {
        await syncCheckInsToSupabase(updatedCheckIns, user.id);
      } catch (error) {
        console.error('Failed to sync check-in:', error);
      }
    }
  };

  const handleSettingsChange = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Sync to Supabase if user is logged in
    if (user) {
      try {
        await syncSettingsToSupabase(newSettings, user.id);
      } catch (error) {
        console.error('Failed to sync settings:', error);
      }
    }
  };

  const loadFriendsProgress = async () => {
    if (!user) return;
    
    setFriendsLoading(true);
    try {
      const friendsProgress = await getFriendsProgress(user.id);
      setFriends(friendsProgress);
    } catch (error) {
      console.error('Failed to load friends progress:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleFriendAdded = () => {
    loadFriendsProgress();
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <UserSetup onSetup={handleUserSetup} isLoading={false} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <Calendar checkIns={checkIns} />;
      case 'stats':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalCheckIns}</div>
                  <div className="text-sm text-gray-600">Total Check-ins</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.weeklySuccessRate}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
            <StreakCounter 
              currentStreak={stats.currentStreak} 
              longestStreak={stats.longestStreak} 
            />
          </div>
        );
      case 'friends':
        return <FriendsProgress friends={friends} isLoading={friendsLoading} />;
      default:
        return (
          <div className="space-y-6">
            <MotivationalMessage stats={stats} isCheckedInToday={isCheckedInToday} />
            
            <div className="flex justify-center">
              <CheckInButton
                isCheckedIn={isCheckedInToday}
                onCheckIn={handleCheckIn}
              />
            </div>

            <StreakCounter 
              currentStreak={stats.currentStreak} 
              longestStreak={stats.longestStreak} 
            />

            <WeeklyProgress 
              checkIns={checkIns} 
              weeklyGoal={settings.weeklyGoal} 
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Gym Tracker</h1>
              <p className="text-xs text-gray-500">Hi, {user.name}!</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddFriend(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <UserPlus size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SettingsIcon size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {renderView()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around py-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'home' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                💪
              </div>
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setCurrentView('stats')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'stats' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 size={24} className="mb-1" />
              <span className="text-xs font-medium">Stats</span>
            </button>

            <button
              onClick={() => setCurrentView('friends')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'friends' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserPlus size={24} className="mb-1" />
              <span className="text-xs font-medium">Friends</span>
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'calendar' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <CalendarIcon size={24} className="mb-1" />
              <span className="text-xs font-medium">History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Settings
        settings={settings}
        onSettingsChange={handleSettingsChange}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Add Friend Modal */}
      <AddFriend
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        onFriendAdded={handleFriendAdded}
        currentUserId={user.id}
        shareCode={user.share_code}
      />
    </div>
  );
}

export default App;
