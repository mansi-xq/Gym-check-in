import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, BellOff, X } from 'lucide-react';
import { AppSettings } from '../types';
import { requestNotificationPermission, scheduleReminder, clearReminders } from '../utils/notifications';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSettingsChange,
  isOpen,
  onClose
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleNotificationToggle = async () => {
    if (!localSettings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        const newSettings = { ...localSettings, notificationsEnabled: true };
        setLocalSettings(newSettings);
        onSettingsChange(newSettings);
        scheduleReminder(newSettings.reminderTime);
      }
    } else {
      clearReminders();
      const newSettings = { ...localSettings, notificationsEnabled: false };
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
    }
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...localSettings, reminderTime: time };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    
    if (newSettings.notificationsEnabled) {
      scheduleReminder(time);
    }
  };

  const handleGoalChange = (goal: number) => {
    const newSettings = { ...localSettings, weeklyGoal: goal };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SettingsIcon size={24} className="text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Weekly Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Goal
            </label>
            <select
              value={localSettings.weeklyGoal}
              onChange={(e) => handleGoalChange(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[3, 4, 5, 6, 7].map(goal => (
                <option key={goal} value={goal}>
                  {goal} days per week
                </option>
              ))}
            </select>
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Daily Reminders
              </label>
              <button
                onClick={handleNotificationToggle}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                  ${localSettings.notificationsEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {localSettings.notificationsEnabled ? (
                  <>
                    <Bell size={16} />
                    <span className="text-sm">On</span>
                  </>
                ) : (
                  <>
                    <BellOff size={16} />
                    <span className="text-sm">Off</span>
                  </>
                )}
              </button>
            </div>

            {localSettings.notificationsEnabled && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={localSettings.reminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};