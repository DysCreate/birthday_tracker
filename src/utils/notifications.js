import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Check if running on a native platform (Android/iOS)
 */
export const isNative = () => Capacitor.isNativePlatform();

/**
 * Request notification permissions
 * Returns true if permission was granted
 */
export async function requestNotificationPermission() {
  if (isNative()) {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }

  // Web fallback — browser Notification API
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Check current notification permission status
 */
export async function checkNotificationPermission() {
  if (isNative()) {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  }

  if ('Notification' in window) {
    return Notification.permission === 'granted';
  }

  return false;
}

/**
 * Cancel all previously scheduled birthday notifications
 */
export async function cancelAllNotifications() {
  if (isNative()) {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
  }
}

/**
 * Calculate the next occurrence of a birthday reminder (1 day before)
 * @param {Date} birthDate - the person's birth date
 * @returns {Date|null} - the next reminder date (day before birthday at 9:00 AM), or null if it's today/passed
 */
function getNextReminderDate(birthDate) {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Birthday this year
  let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

  // If the birthday (not reminder) has passed this year, schedule for next year
  if (nextBirthday < now) {
    nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
  }

  // Reminder = 1 day before the birthday at 9:00 AM
  const reminderDate = new Date(nextBirthday);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(9, 0, 0, 0);

  // If the reminder time has already passed, schedule for next year's birthday
  if (reminderDate < now) {
    nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    const nextReminder = new Date(nextBirthday);
    nextReminder.setDate(nextReminder.getDate() - 1);
    nextReminder.setHours(9, 0, 0, 0);
    return nextReminder;
  }

  return reminderDate;
}

/**
 * Schedule birthday reminder notifications for all contacts
 * Notifications fire 1 day before each birthday at 9:00 AM
 *
 * @param {Array<{name: string, birthDate: Date}>} contacts
 * @returns {Promise<{scheduled: number, skipped: number}>}
 */
export async function scheduleAllBirthdayNotifications(contacts) {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return { scheduled: 0, skipped: contacts.length, permissionDenied: true };
  }

  // Cancel existing scheduled notifications first
  await cancelAllNotifications();

  let scheduled = 0;
  let skipped = 0;

  if (isNative()) {
    // --- Capacitor Local Notifications ---
    const notifications = [];

    contacts.forEach((contact, index) => {
      const reminderDate = getNextReminderDate(contact.birthDate);
      if (!reminderDate) {
        skipped++;
        return;
      }

      const birthdayMonth = contact.birthDate.toLocaleString('default', { month: 'long' });
      const birthdayDay = contact.birthDate.getDate();

      notifications.push({
        title: '🎂 Birthday Reminder!',
        body: `${contact.name}'s birthday is tomorrow (${birthdayMonth} ${birthdayDay})! Don't forget to wish them! 🎉`,
        id: index + 1, // IDs must be unique positive integers
        schedule: {
          at: reminderDate,
          allowWhileIdle: true,
        },
        sound: 'beep.wav',
        smallIcon: 'ic_stat_icon_config_sample',
        actionTypeId: '',
        extra: {
          contactName: contact.name,
          birthdayDate: contact.birthDate.toISOString(),
        },
      });

      scheduled++;
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } else {
    // --- Web fallback (browser notifications — limited, but useful for testing) ---
    // Browser notifications can't be truly scheduled for the future,
    // so we just log the intent. Real scheduling requires a service worker.
    contacts.forEach((contact) => {
      const reminderDate = getNextReminderDate(contact.birthDate);
      if (reminderDate) {
        scheduled++;
        console.log(
          `[Web] Would schedule notification for ${contact.name} at ${reminderDate.toISOString()}`
        );
      } else {
        skipped++;
      }
    });
  }

  console.log(`Notifications scheduled: ${scheduled}, skipped: ${skipped}`);
  return { scheduled, skipped, permissionDenied: false };
}

/**
 * Save contacts to localStorage for persistence across app restarts
 */
export function saveContactsToStorage(contacts) {
  const serialized = contacts.map(c => ({
    name: c.name,
    birthDate: c.birthDate.toISOString(),
  }));
  localStorage.setItem('birthday_contacts', JSON.stringify(serialized));
}

/**
 * Load contacts from localStorage
 * @returns {Array<{name: string, birthDate: Date}>|null}
 */
export function loadContactsFromStorage() {
  const data = localStorage.getItem('birthday_contacts');
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    return parsed.map(c => ({
      name: c.name,
      birthDate: new Date(c.birthDate),
    }));
  } catch {
    return null;
  }
}

/**
 * Clear contacts from localStorage
 */
export function clearContactsFromStorage() {
  localStorage.removeItem('birthday_contacts');
}
