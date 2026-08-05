import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import FileUpload from './components/FileUpload';
import DatePicker from './components/DatePicker';
import ContactList from './components/ContactList';
import { Bell, BellOff, BellRing, Check, X } from 'lucide-react';
import {
  scheduleAllBirthdayNotifications,
  cancelAllNotifications,
  checkNotificationPermission,
  saveContactsToStorage,
  loadContactsFromStorage,
  clearContactsFromStorage,
  isNative,
} from './utils/notifications';

function App() {
  const [contacts, setContacts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [parseError, setParseError] = useState(null);
  const datePickerRef = useRef(null);

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

    if (isNative()) {
      checkNotificationPermission().then(granted => {
        setNotificationsEnabled(granted);
      });
    }
  }, []);

  useEffect(() => {
    if (contacts.length > 0 && datePickerRef.current) {
      setTimeout(() => {
        datePickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [contacts]);

  const parseDate = (dateValue) => {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      return isNaN(date.getTime()) ? null : date;
    }

    if (typeof dateValue === 'string') {
      const trimmed = dateValue.trim();
      const ddmmyyyyPattern = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
      const match = trimmed.match(ddmmyyyyPattern);

      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const date = new Date(year, month - 1, day);
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
    if (contacts.length === 0 || !isNative()) return;

    const result = await scheduleAllBirthdayNotifications(contacts);
    setNotificationStatus(result);
    setShowNotificationBanner(true);

    if (!result.permissionDenied) {
      setNotificationsEnabled(true);
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
      setParseError(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const firstRow = jsonData[0];
        const hasHeaders = firstRow && firstRow.length >= 2 &&
                          (String(firstRow[0]).toLowerCase().includes('name') ||
                           String(firstRow[1]).toLowerCase().includes('birth') ||
                           String(firstRow[1]).toLowerCase().includes('date'));

        const startRow = hasHeaders ? 1 : 0;

        const MAX_CONTACTS = 5000;
        if (jsonData.length - startRow > MAX_CONTACTS) {
          alert(`File contains too many contacts. Maximum allowed is ${MAX_CONTACTS}.`);
          return;
        }

        const sanitizeName = (raw) => {
          let name = String(raw).trim();
          if (name.length > 200) {
            name = name.substring(0, 200);
          }
          return name.split('').filter(c => {
            const code = c.charCodeAt(0);
            return code >= 0x20 || code === 0x09 || code === 0x0A || code === 0x0D;
          }).join('');
        };

        const parsedContacts = jsonData
          .slice(startRow)
          .map((row) => {
            if (!row || row.length < 2) {
              return null;
            }

            const name = sanitizeName(row[0]);
            const dateValue = row[1];

            if (!name || !dateValue) {
              return null;
            }

            const birthDate = parseDate(dateValue);
            if (!birthDate) {
              return null;
            }

            return {
              name: name,
              birthDate: birthDate
            };
          })
          .filter(contact => contact !== null);

        if (parsedContacts.length === 0) {
          setParseError('No valid contacts found. Make sure your file has two columns: "Name" and "BirthDate" (DD-MM-YYYY format).');
          return;
        }

        setParseError(null);
        setContacts(parsedContacts);

        saveContactsToStorage(parsedContacts);

        const today = new Date();
        setSelectedDate(today);

        const todayBirthdays = parsedContacts.filter(contact => {
          return contact.birthDate.getMonth() === today.getMonth() &&
                 contact.birthDate.getDate() === today.getDate();
        });
        setFilteredContacts(todayBirthdays);

        if (isNative()) {
          const hasPermission = await checkNotificationPermission();
          if (hasPermission) {
            const result = await scheduleAllBirthdayNotifications(parsedContacts);
            setNotificationStatus(result);
            setNotificationsEnabled(true);
            setShowNotificationBanner(true);
            setTimeout(() => setShowNotificationBanner(false), 5000);
          }
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        setParseError('Failed to read file. Please upload a valid .xlsx, .xls, or .csv file with "Name" and "BirthDate" columns.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);

    const filtered = contacts.filter(contact => {
      return contact.birthDate.getMonth() === date.getMonth() &&
             contact.birthDate.getDate() === date.getDate();
    });

    setFilteredContacts(filtered);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: '#FFF9EC' }}>
      <div className="max-w-4xl mx-auto">
        <div className="animate-slap text-center mb-10">
          <div className="inline-block brutal-border-thick bg-accent-tertiary px-6 py-3 mb-4 -rotate-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display text-ink uppercase tracking-tight">
              Birthday Tracker
            </h1>
          </div>
          <p className="font-body text-ink text-lg max-w-xl mx-auto">
            NEVER MISS A BIRTHDAY AGAIN
          </p>
        </div>

        <div className="brutal-divider mb-8" />

        <AnimatePresence>
          {showNotificationBanner && notificationStatus && (
            <div className="mb-6 animate-slap">
              <div className={`brutal-border flex items-center justify-between p-4 ${
                notificationStatus.permissionDenied ? 'bg-accent-primary' : 'bg-success'
              }`}>
                <div className="flex items-center gap-3">
                  {notificationStatus.permissionDenied ? (
                    <BellOff className="w-5 h-5 text-ink shrink-0" />
                  ) : (
                    <Check className="w-5 h-5 text-ink shrink-0" />
                  )}
                  <span className="font-body font-bold text-ink text-sm uppercase">
                    {notificationStatus.permissionDenied
                      ? 'Notification permission denied. Please enable in your device settings.'
                      : `${notificationStatus.scheduled} reminder${notificationStatus.scheduled !== 1 ? 's' : ''} scheduled! You'll be notified 1 day before each birthday at 9:00 AM.`
                    }
                  </span>
                </div>
                <button
                  onClick={() => setShowNotificationBanner(false)}
                  className="brutal-button bg-surface px-3 py-1 text-sm uppercase font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {parseError && (
          <div className="mb-6 animate-slap">
            <div className="brutal-border bg-accent-primary flex items-start justify-between p-4 gap-3">
              <div className="flex items-start gap-3">
                <span className="font-mono text-ink font-bold text-lg leading-none shrink-0 mt-0.5">!</span>
                <span className="font-body font-bold text-ink text-sm uppercase">{parseError}</span>
              </div>
              <button
                onClick={() => setParseError(null)}
                className="brutal-button bg-surface px-2 py-1 text-xs uppercase font-bold shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        {contacts.length > 0 && (
          <>
            <div className="brutal-divider mb-8" />

            <div className="mb-8 animate-slap">
              <div className="bg-surface brutal-border brutal-shadow p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 brutal-border-thin ${notificationsEnabled ? 'bg-accent-primary' : 'bg-bg'}`}>
                      {notificationsEnabled ? (
                        <BellRing className="w-6 h-6 text-ink" />
                      ) : (
                        <Bell className="w-6 h-6 text-ink" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-ink text-lg uppercase tracking-tight">Birthday Reminders</h3>
                      <p className="font-mono text-ink text-xs uppercase tracking-wide">
                        {notificationsEnabled
                          ? 'You will receive notifications 1 day before each birthday'
                          : 'Get notified 1 day before upcoming birthdays'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={notificationsEnabled ? handleDisableNotifications : handleEnableNotifications}
                    disabled={!isNative()}
                    className={`brutal-button px-5 py-3 text-sm uppercase font-bold ${
                      notificationsEnabled
                        ? 'bg-bg text-ink'
                        : 'bg-accent-primary text-ink'
                    }`}
                    style={!isNative() ? { boxShadow: 'none', transform: 'none' } : {}}
                  >
                    {notificationsEnabled ? 'Disable' : 'Enable Reminders'}
                  </button>
                </div>
                {!isNative() && (
                  <div className="brutal-border-thin bg-accent-tertiary px-4 py-2 mt-4 inline-block -rotate-1">
                    <p className="font-mono text-ink text-xs uppercase font-bold tracking-wide">
                      Note: Reminders are not yet available in the web version. Mobile app support is coming soon.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="brutal-divider mb-8" />

            <div ref={datePickerRef} className="mb-8">
              <DatePicker
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
                contacts={contacts}
              />
            </div>

            <ContactList
              contacts={filteredContacts}
              selectedDate={selectedDate}
            />
          </>
        )}

        {contacts.length === 0 && (
          <div className="animate-slap bg-surface brutal-border brutal-shadow-lg p-8 mt-8">
            <div className="bg-accent-tertiary brutal-border-thin px-4 py-2 inline-block -rotate-1 mb-6 -ml-2">
              <h3 className="font-display text-ink text-xl uppercase tracking-tight">
                HOW TO USE
              </h3>
            </div>
            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="font-mono text-ink font-bold text-lg leading-tight shrink-0 w-8 h-8 brutal-border-thin bg-accent-primary flex items-center justify-center">1</span>
                <span className="font-body text-ink">Prepare an Excel file with columns named "Name" and "BirthDate"</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="font-mono text-ink font-bold text-lg leading-tight shrink-0 w-8 h-8 brutal-border-thin bg-accent-secondary flex items-center justify-center">2</span>
                <span className="font-body text-ink">Upload your file using the drag-and-drop zone above</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="font-mono text-ink font-bold text-lg leading-tight shrink-0 w-8 h-8 brutal-border-thin bg-accent-tertiary flex items-center justify-center">3</span>
                <span className="font-body text-ink">Select a date from the calendar to view birthdays</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="font-mono text-ink font-bold text-lg leading-tight shrink-0 w-8 h-8 brutal-border-thin bg-accent-primary flex items-center justify-center">4</span>
                <span className="font-body text-ink">Enable birthday reminders to get notified 1 day before each birthday</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
