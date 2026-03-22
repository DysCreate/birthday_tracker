import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import FileUpload from './components/FileUpload';
import DatePicker from './components/DatePicker';
import ContactList from './components/ContactList';
import { Bell, BellOff, BellRing, Sparkles, Check, X } from 'lucide-react';
import {
  scheduleAllBirthdayNotifications,
  cancelAllNotifications,
  checkNotificationPermission,
  saveContactsToStorage,
  loadContactsFromStorage,
  clearContactsFromStorage,
} from './utils/notifications';

function App() {
  const [contacts, setContacts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null); // { scheduled, skipped, permissionDenied }
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const datePickerRef = useRef(null);

  // Load persisted contacts on app start
  useEffect(() => {
    const saved = loadContactsFromStorage();
    if (saved && saved.length > 0) {
      setContacts(saved);
      const today = new Date();
      setSelectedDate(today);
      const todayBirthdays = saved.filter(contact =>
        contact.birthDate.getMonth() === today.getMonth() &&
        contact.birthDate.getDate() === today.getDate()
      );
      setFilteredContacts(todayBirthdays);
    }

    // Check if notifications are already permitted
    checkNotificationPermission().then(granted => {
      setNotificationsEnabled(granted);
    });
  }, []);

  // Scroll to date picker when contacts are loaded
  useEffect(() => {
    if (contacts.length > 0 && datePickerRef.current) {
      setTimeout(() => {
        datePickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [contacts]);

  const parseDate = (dateValue) => {
    if (!dateValue) return null;

    // If it's already a Date object
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    // If it's an Excel serial number
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      return isNaN(date.getTime()) ? null : date;
    }

    // If it's a string, ONLY accept DD-MM-YYYY format
    if (typeof dateValue === 'string') {
      const trimmed = dateValue.trim();
      
      // Match DD-MM-YYYY format (with - or / separators)
      const ddmmyyyyPattern = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
      const match = trimmed.match(ddmmyyyyPattern);
      
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        
        // Validate the date components
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const date = new Date(year, month - 1, day);
          // Double-check the date is valid (handles invalid dates like Feb 31)
          if (date.getDate() === day && date.getMonth() === month - 1) {
            return date;
          }
        }
      }
      
      return null;
    }

    return null;
  };

  const handleEnableNotifications = async () => {
    if (contacts.length === 0) return;

    const result = await scheduleAllBirthdayNotifications(contacts);
    setNotificationStatus(result);
    setShowNotificationBanner(true);

    if (!result.permissionDenied) {
      setNotificationsEnabled(true);
      // Auto-hide banner after 5 seconds
      setTimeout(() => setShowNotificationBanner(false), 5000);
    }
  };

  const handleDisableNotifications = async () => {
    await cancelAllNotifications();
    setNotificationsEnabled(false);
    setNotificationStatus(null);
    setShowNotificationBanner(false);
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      setContacts([]);
      setFilteredContacts([]);
      setSelectedDate(null);
      clearContactsFromStorage();
      setNotificationStatus(null);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Read without headers first to check the data
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Check if first row looks like headers or data
        const firstRow = jsonData[0];
        const hasHeaders = firstRow && firstRow.length >= 2 && 
                          (String(firstRow[0]).toLowerCase().includes('name') || 
                           String(firstRow[1]).toLowerCase().includes('birth') ||
                           String(firstRow[1]).toLowerCase().includes('date'));
        
        // Start from row 1 if headers exist, otherwise row 0
        const startRow = hasHeaders ? 1 : 0;
        
        const parsedContacts = jsonData
          .slice(startRow)
          .map((row, index) => {
            if (!row || row.length < 2) {
              return null;
            }
            
            const name = row[0];
            const dateValue = row[1];
            
            if (!name || !dateValue) {
              return null;
            }

            const birthDate = parseDate(dateValue);
            if (!birthDate) {
              return null;
            }

            return {
              name: String(name).trim(),
              birthDate: birthDate
            };
          })
          .filter(contact => contact !== null);

        setContacts(parsedContacts);
        
        // Save to localStorage for persistence
        saveContactsToStorage(parsedContacts);

        // Automatically select today's date to show birthdays
        const today = new Date();
        setSelectedDate(today);
        
        // Filter contacts for today's birthdays
        const todayBirthdays = parsedContacts.filter(contact => {
          return contact.birthDate.getMonth() === today.getMonth() &&
                 contact.birthDate.getDate() === today.getDate();
        });
        setFilteredContacts(todayBirthdays);

        // Auto-schedule notifications if permission is already granted
        const hasPermission = await checkNotificationPermission();
        if (hasPermission) {
          const result = await scheduleAllBirthdayNotifications(parsedContacts);
          setNotificationStatus(result);
          setNotificationsEnabled(true);
          setShowNotificationBanner(true);
          setTimeout(() => setShowNotificationBanner(false), 5000);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please make sure it contains "Name" and "BirthDate" columns.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    
    // Filter contacts by month and day (ignore year)
    const filtered = contacts.filter(contact => {
      return contact.birthDate.getMonth() === date.getMonth() &&
             contact.birthDate.getDate() === date.getDate();
    });

    setFilteredContacts(filtered);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Birthday Tracker
            </h1>
      
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Never miss a birthday again
          </p>
        </motion.div>

        {/* Notification Banner */}
        <AnimatePresence>
          {showNotificationBanner && notificationStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6"
            >
              <div className={`rounded-2xl p-4 border flex items-center justify-between ${
                notificationStatus.permissionDenied
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <div className="flex items-center gap-3">
                  {notificationStatus.permissionDenied ? (
                    <BellOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <Check className="w-5 h-5 text-emerald-500" />
                  )}
                  <span className="text-sm font-medium">
                    {notificationStatus.permissionDenied
                      ? 'Notification permission denied. Please enable in your device settings.'
                      : `🎉 ${notificationStatus.scheduled} birthday reminder${notificationStatus.scheduled !== 1 ? 's' : ''} scheduled! You'll be notified 1 day before each birthday at 9:00 AM.`
                    }
                  </span>
                </div>
                <button
                  onClick={() => setShowNotificationBanner(false)}
                  className="text-current opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Upload */}
        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        {/* Notification Controls - Only show when contacts are loaded */}
        {contacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${notificationsEnabled ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                    {notificationsEnabled ? (
                      <BellRing className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Bell className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 text-sm">Birthday Reminders</h3>
                    <p className="text-xs text-slate-500">
                      {notificationsEnabled
                        ? 'You\'ll receive notifications 1 day before each birthday'
                        : 'Get notified 1 day before upcoming birthdays'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={notificationsEnabled ? handleDisableNotifications : handleEnableNotifications}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    notificationsEnabled
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {notificationsEnabled ? 'Disable' : 'Enable Reminders'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Date Picker - Only show when contacts are loaded */}
        {contacts.length > 0 && (
          <motion.div
            ref={datePickerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <DatePicker 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              autoOpen={true}
              contacts={contacts}
            />
          </motion.div>
        )}

        {/* Contact List */}
        {contacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ContactList 
              contacts={filteredContacts}
              selectedDate={selectedDate}
            />
          </motion.div>
        )}

        {/* Instructions - Only show when no file is uploaded */}
        {contacts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200"
          >
            <h3 className="text-xl font-semibold text-slate-700 mb-4">
              How to use:
            </h3>
            <ol className="space-y-3 text-slate-600">
              <li className="flex items-start">
                <span className="font-semibold text-primary-600 mr-3">1.</span>
                <span>Prepare an Excel file with columns named "Name" and "BirthDate"</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-primary-600 mr-3">2.</span>
                <span>Upload your file using the drag-and-drop zone above</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-primary-600 mr-3">3.</span>
                <span>Select a date from the calendar to view birthdays</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-primary-600 mr-3">4.</span>
                <span>Enable birthday reminders to get notified 1 day before each birthday 🔔</span>
              </li>
            </ol>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
