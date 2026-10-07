import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import FileUpload from './components/FileUpload';
import DatePicker from './components/DatePicker';
import ContactList from './components/ContactList';
import { Bell, BellOff, BellRing, Check, X } from 'lucide-react';
import {
  Balloon,
  CakeDoodle,
  Confetti,
  CurvyArrow,
  DashedPath,
  Heart,
  PaperPlane,
  Sparkle,
  SquiggleUnderline,
  Sun,
  Swirl,
} from './components/Doodles';
import {
  scheduleAllBirthdayNotifications,
  cancelAllNotifications,
  checkNotificationPermission,
  saveContactsToStorage,
  loadContactsFromStorage,
  clearContactsFromStorage,
  isNative,
} from './utils/notifications';

const HOW_TO_STEPS = [
  'Prepare an Excel file with columns named "Name" and "BirthDate"',
  'Upload your file using the drag-and-drop zone above',
  'Select a date from the calendar to view birthdays',
  'Enable birthday reminders to get notified 1 day before each birthday',
];

const STEP_TINTS = ['bg-sunshine', 'bg-baby-blue-soft', 'bg-sunshine-soft', 'bg-paper-shade'];

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
    <div className="min-h-screen pb-24">
      {/* ---------------------------------------------------------------- nav */}
      <header className="sticky top-0 z-40 border-b-2 border-dashed border-ink/30 bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <a href="#top" className="group flex shrink-0 items-center gap-2">
            <CakeDoodle className="h-7 w-7 text-red transition-transform duration-200 group-hover:-rotate-12" />
            <span className="font-brush text-xl leading-none text-ink sm:text-2xl">
              Birthday<span className="text-red">Tracker</span>
            </span>
          </a>

          <nav aria-label="Page sections" className="hidden items-center gap-6 md:flex">
            <a className="nav-link" href="#upload">Upload</a>
            {contacts.length > 0 && (
              <>
                <a className="nav-link" href="#calendar">Calendar</a>
                <a className="nav-link" href="#birthdays">Birthdays</a>
              </>
            )}
          </nav>

          <a href="#upload" className="btn btn-outline btn-sm nav-cta">
            Add Birthdays <span aria-hidden="true">+</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ------------------------------------------------------------- hero */}
        <section id="top" className="relative pt-10 pb-6 sm:pt-14">
          <Confetti className="doodle doodle-twinkle left-0 top-4 hidden h-16 w-16 text-red sm:block lg:h-20 lg:w-20" />
          <Sun className="doodle doodle-float right-1 top-0 h-14 w-14 text-sunshine drop-shadow-[1px_2px_0_rgba(26,26,26,0.35)] sm:right-6 sm:h-20 sm:w-20" />
          <Sparkle className="doodle doodle-twinkle right-24 top-24 hidden h-6 w-6 text-red lg:block" />
          <Sparkle className="doodle left-10 bottom-6 hidden h-5 w-5 text-ink/40 lg:block" />
          <Swirl className="doodle hidden h-12 w-12 text-ink/30 md:block" style={{ left: '18%', top: '6%' }} />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="eyebrow">— your scrapbook of big days —</p>

            <h1 className="marker-title mt-3 text-[2.1rem] sm:text-5xl md:text-6xl lg:text-7xl">
              Never Miss a Big Day.
            </h1>

            <SquiggleUnderline className="mx-auto mt-2 h-4 w-[64%] max-w-md text-red" />

            <p className="hand-note mt-4 text-2xl sm:text-3xl">
              good cake. good people. happy vibes <span className="text-red">♡</span>
            </p>

            <p className="mx-auto mt-3 max-w-md text-sm text-ink/85 sm:text-base">
              Stick your list on the page and every candle gets remembered — pinned to the
              calendar, ready to celebrate.
            </p>
          </div>

          <CurvyArrow className="doodle hidden h-16 w-16 text-ink/45 lg:block" style={{ right: '12%', bottom: '-1rem' }} />
        </section>

        <hr className="rule-dashed my-6" />

        {/* ------------------------------------------------------- alerts */}
        <AnimatePresence>
          {showNotificationBanner && notificationStatus && (
            <div className="animate-rise mb-6">
              <div
                role="status"
                className={`note relative flex items-start justify-between gap-3 px-4 py-4 pr-3 sm:px-6 ${
                  notificationStatus.permissionDenied ? 'bg-paper-shade' : 'bg-sunshine-soft'
                }`}
              >
                <span className="tape tape-red" aria-hidden="true" />

                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 rotate-[-6deg] items-center justify-center rounded-lg border-2 border-ink ${
                      notificationStatus.permissionDenied ? 'bg-red' : 'bg-sunshine'
                    }`}
                  >
                    {notificationStatus.permissionDenied ? (
                      <BellOff className={`h-4 w-4 ${notificationStatus.permissionDenied ? 'text-white' : 'text-ink'}`} aria-hidden="true" />
                    ) : (
                      <Check className="h-4 w-4 text-ink" aria-hidden="true" />
                    )}
                  </span>
                  <p className="text-sm font-medium leading-snug text-ink">
                    {notificationStatus.permissionDenied
                      ? 'Notification permission denied. Please enable it in your device settings.'
                      : `${notificationStatus.scheduled} reminder${notificationStatus.scheduled !== 1 ? 's' : ''} scheduled! You'll be notified 1 day before each birthday at 9:00 AM.`
                    }
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Dismiss notification message"
                  onClick={() => setShowNotificationBanner(false)}
                  className="btn btn-sm btn-icon"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {parseError && (
          <div className="animate-rise mb-6">
            <div role="alert" className="note relative flex items-start justify-between gap-3 border-red bg-paper px-4 py-4 sm:px-6">
              <span className="tape tape-red tape-tilt-r" aria-hidden="true" />

              <div className="flex items-start gap-3">
                <span className="font-marker mt-0.5 flex h-8 w-8 shrink-0 rotate-[-6deg] items-center justify-center rounded-lg border-2 border-ink bg-red text-lg leading-none text-white">
                  !
                </span>
                <p className="text-sm font-medium leading-snug text-ink">{parseError}</p>
              </div>

              <button
                type="button"
                aria-label="Dismiss error message"
                onClick={() => setParseError(null)}
                className="btn btn-sm btn-icon"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- upload */}
        <section id="upload" className="relative pt-2">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="section-heading">
              <PaperPlane className="h-5 w-5 text-red" />
              <span className="label-serif text-[0.62rem] text-ink">step one · your list</span>
            </span>
            {contacts.length === 0 ? (
              <span className="sticker rotate-[3deg]">start here</span>
            ) : (
              <span className="sticker sticker-paper">
                {contacts.length} {contacts.length === 1 ? 'birthday' : 'birthdays'} saved
              </span>
            )}
          </div>

          <FileUpload onFileUpload={handleFileUpload} />
        </section>

        {contacts.length > 0 && (
          <>
            <DashedPath className="mt-10 h-9 w-full text-ink/35" />

            {/* ------------------------------------------------- reminders */}
            <section id="reminders" aria-label="Birthday reminders" className="mt-6 mb-10">
              <div className="animate-rise relative">
                <span className="tape tape-wide tape-blue" aria-hidden="true" />

                <div className="card px-5 py-6 sm:px-7 sm:py-7">
                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-14 w-14 shrink-0 rotate-[-6deg] items-center justify-center rounded-2xl border-2 border-ink ${
                          notificationsEnabled ? 'bg-red' : 'bg-sunshine'
                        }`}
                      >
                        {notificationsEnabled ? (
                          <BellRing className="h-7 w-7 text-white" aria-hidden="true" />
                        ) : (
                          <Bell className="h-7 w-7 text-ink" aria-hidden="true" />
                        )}
                      </span>

                      <div className="min-w-0">
                        <h2 className="font-brush text-2xl text-ink">Birthday reminders</h2>
                        <p className="mt-0.5 text-xs text-ink/75">
                          {notificationsEnabled
                            ? 'You will receive notifications 1 day before each birthday'
                            : 'Get notified 1 day before upcoming birthdays'
                          }
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={notificationsEnabled ? handleDisableNotifications : handleEnableNotifications}
                      disabled={!isNative()}
                      aria-pressed={notificationsEnabled}
                      className={`btn ${notificationsEnabled ? 'bg-paper' : 'btn-primary'}`}
                    >
                      {notificationsEnabled ? 'Disable' : 'Enable reminders'}
                    </button>
                  </div>

                  {!isNative() && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-dashed border-ink/40 bg-paper-warm px-4 py-3">
                      <Sparkle className="mt-0.5 h-4 w-4 shrink-0 text-red" />
                      <p className="text-xs text-ink/85">
                        Reminders are not yet available in the web version — mobile app support
                        is coming soon.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <hr className="rule-dashed mb-10" />

            {/* ---------------------------------------------------- calendar */}
            <section id="calendar" className="mb-10">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="section-heading">
                  <CakeDoodle className="h-6 w-6 text-red" />
                  <span className="label-serif text-[0.62rem] text-ink">step two · pick a day</span>
                </span>
                <span className="font-hand text-xl font-bold text-ink/80">
                  tap a yellow square — that day is someone&apos;s birthday
                </span>
              </div>

              <div ref={datePickerRef}>
                <DatePicker
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                  contacts={contacts}
                />
              </div>
            </section>

            {/* --------------------------------------------------- birthdays */}
            <section id="birthdays" aria-label="Birthdays on the selected date">
              <ContactList
                contacts={filteredContacts}
                selectedDate={selectedDate}
              />
            </section>
          </>
        )}

        {/* ------------------------------------------------------- how-to */}
        {contacts.length === 0 && (
          <section className="relative mt-10">
            <div className="animate-rise note relative px-5 py-9 sm:px-10 sm:py-11">
              <span className="tape tape-wide tape-red" aria-hidden="true" />

              <Sparkle className="doodle doodle-twinkle right-6 top-8 h-5 w-5 text-red" />
              <Sparkle className="doodle doodle-twinkle left-6 bottom-8 h-4 w-4 text-ink/35" />

              <div className="mb-7 text-center">
                <div className="relative mx-auto w-24">
                  <Balloon className="doodle-float mx-auto h-20 w-20 text-baby-blue-deep" />
                  <Heart className="doodle -right-2 bottom-1 h-8 w-8 text-red" />
                  <Confetti className="doodle -left-4 top-0 h-9 w-9 text-ink/45" />
                </div>

                <h2 className="font-marker mt-4 rotate-[-2deg] text-2xl text-red sm:text-3xl">
                  Nothing pinned here yet!
                </h2>
                <p className="font-hand mt-2 text-2xl font-bold text-ink">
                  three little steps and you&apos;re good to go ♡
                </p>
              </div>

              <ol className="mx-auto grid max-w-2xl gap-4">
                {HOW_TO_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-4">
                    <span
                      className={`font-marker flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-ink text-lg leading-none shadow-sticker ${STEP_TINTS[index % STEP_TINTS.length]}`}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span className="pt-1 text-sm text-ink sm:text-base">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
