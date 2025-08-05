export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const scheduleReminder = (time: string): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Clear existing reminders
  clearReminders();

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(hours, minutes, 0, 0);

  // If the time has passed today, schedule for tomorrow
  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  const timeUntilReminder = reminderTime.getTime() - now.getTime();

  const timeoutId = setTimeout(() => {
    new Notification('Gym Check-in Reminder', {
      body: "Don't forget to hit the gym today! 💪",
      icon: '/vite.svg',
      badge: '/vite.svg'
    });

    // Schedule the next day's reminder
    scheduleReminder(time);
  }, timeUntilReminder);

  // Store timeout ID for cleanup
  localStorage.setItem('reminder-timeout', timeoutId.toString());
};

export const clearReminders = (): void => {
  const timeoutId = localStorage.getItem('reminder-timeout');
  if (timeoutId) {
    clearTimeout(Number(timeoutId));
    localStorage.removeItem('reminder-timeout');
  }
};