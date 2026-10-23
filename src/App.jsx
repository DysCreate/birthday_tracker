import { useState, useRef, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import FileUpload from './components/FileUpload';
import DatePicker from './components/DatePicker';
import ContactList from './components/ContactList';
import { getTurnInfo } from './utils/birthdays';
import { Bell, BellOff, BellRing, Check, Plus, Sparkle, X } from 'lucide-react';
import { BalloonCluster, CakeDoodle, CakeSliceArt, SquiggleArt, StarArt } from './components/Doodles';
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
  'Upload your file using the drop zone above',
  'Select a date from the calendar to view birthdays',
  'Enable birthday reminders to get notified 1 day before each birthday',
];

const CONFETTI_COLORS = [
  'var(--pink)',
  'var(--yellow)',
  'var(--green)',
  'var(--grape)',
  'var(--cream)',
  'var(--red)',
];

/* 12–16 point star for the age badge. */
const starPoints = (points = 16, outer = 48, inner = 37) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    return `${(50 + radius * Math.cos(angle)).toFixed(2)},${(50 + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');

/* Deterministic scatter so re-renders never reshuffle the confetti mid-burst. */
const seeded = (index, salt) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const whenLabel = ({ daysLeft, isToday }) =>
  isToday ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`;

function Marquee({ items }) {
  if (items.length === 0) {
    return (
      <div className="marquee">
        <p className="marquee__static">No birthdays this week</p>
      </div>
    );
  }

  const group = (copy) => (
    <span className="marquee__group">
      {items.map((item, index) => (
        <span className="marquee__item" key={`${copy}-${index}`}>
          <span>{item.name}</span>
          <span className="marquee__when">{whenLabel(item)}</span>
          <span className="marquee__star" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="marquee">
      <div className="marquee__track" aria-hidden="true">
        {group('a')}
        {group('b')}
      </div>
      <p className="sr-only">
        Birthdays this week: {items.map((item) => `${item.name}, ${whenLabel(item)}`).join('; ')}.
      </p>
    </div>
  );
}

function NextUpPoster({ next, todayCount }) {
  const tone = next.isToday || next.daysLeft <= 7 ? 'soon' : 'later';
  const dateLabel = next.next.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section
      className={`hero hero--${next.isToday ? 'today' : tone}`}
      aria-labelledby="next-up-name"
    >
      <div className="hero__strip" aria-hidden="true" />

      {next.age !== null && (
        <div className="hero__badge">
          <span
            className="starburst"
            role="img"
            aria-label={`Turns ${next.age} on their next birthday`}
          >
            <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
              <polygon points={starPoints(16, 48, 37)} />
            </svg>
            <span className="starburst__num" aria-hidden="true">
              {next.age}
            </span>
          </span>
          <span className="marker-note" aria-hidden="true">
            turns {next.age}!
          </span>
        </div>
      )}

      <div className="hero__inner">
        <BalloonCluster className="hero__art" />

        <div className="hero__copy">
          <p className="hero__kicker">Next up</p>
          <h2 className="hero__name" id="next-up-name">
            {next.name}
          </h2>

          {next.isToday ? (
            <p className="hero__countdown">Today!</p>
          ) : (
            <p className="hero__countdown">
              <span className="hero__numeral">{next.daysLeft}</span>
              <span className="hero__unit">{next.daysLeft === 1 ? 'day' : 'days'}</span>
            </p>
          )}

          <p className="hero__date">{dateLabel}</p>

          {next.isToday && todayCount > 1 && (
            <p className="hero__more">{todayCount} birthdays today</p>
          )}

          <a href="#calendar" className="btn btn--primary">
            Pick a date
          </a>
        </div>
      </div>
    </section>
  );
}

const readInitialBirthdays = () => {
  const saved = loadContactsFromStorage() || [];
  const today = new Date();

  return {
    contacts: saved,
    selectedDate: saved.length > 0 ? today : null,
    filteredContacts:
      saved.length > 0
        ? saved.filter(
            (contact) =>
              contact.birthDate.getMonth() === today.getMonth() &&
              contact.birthDate.getDate() === today.getDate()
          )
        : [],
  };
};

function App() {
  const [initialData] = useState(readInitialBirthdays);
  const [contacts, setContacts] = useState(initialData.contacts);
  const [selectedDate, setSelectedDate] = useState(initialData.selectedDate);
  const [filteredContacts, setFilteredContacts] = useState(initialData.filteredContacts);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const datePickerRef = useRef(null);
  const driftRef = useRef(null);

  const turned = useMemo(
    () => contacts.map((contact) => ({ ...contact, ...getTurnInfo(contact.birthDate) })),
    [contacts]
  );

  const nextUp = useMemo(
    () =>
      turned.reduce(
        (best, person) => (!best || person.daysLeft < best.daysLeft ? person : best),
        null
      ),
    [turned]
  );

  const todayCount = useMemo(() => turned.filter((person) => person.isToday).length, [turned]);
  const hasToday = todayCount > 0;

  const weekItems = useMemo(
    () =>
      turned
        .filter((person) => person.daysLeft <= 7)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 12),
    [turned]
  );

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => ({
        left: `${(seeded(index, 1) * 100).toFixed(2)}%`,
        drift: `${Math.round((seeded(index, 2) - 0.5) * 260)}px`,
        spin: `${Math.round(200 + seeded(index, 3) * 520)}deg`,
        fall: `${(0.9 + seeded(index, 4) * 0.6).toFixed(2)}s`,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        round: index % 3 === 0,
      })),
    []
  );

  useEffect(() => {
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

  useEffect(() => {
    if (!hasToday) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const start = setTimeout(() => setConfettiOn(true), 0);
    const stop = setTimeout(() => setConfettiOn(false), 1900);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [hasToday]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.06, 24);
        driftRef.current?.style.setProperty('--parallax', `${offset}px`);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

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
      const ddmmyyyyPattern = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
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

  const notificationDenied = notificationStatus?.permissionDenied;

  return (
    <>
      {confettiOn && (
        <div className="confetti" aria-hidden="true">
          {confettiPieces.map((piece, index) => (
            <span
              key={index}
              className={`confetti__piece${piece.round ? ' confetti__piece--round' : ''}`}
              style={{
                left: piece.left,
                background: piece.color,
                '--drift': piece.drift,
                '--spin': piece.spin,
                '--fall': piece.fall,
              }}
            />
          ))}
        </div>
      )}

      <div className="app-shell" id="top">
        <div className="backdrop" aria-hidden="true">
          <div className="backdrop__drift" ref={driftRef}>
            <BalloonCluster className="bg-shape bg-shape--balloons" />
            <StarArt className="bg-shape bg-shape--star" />
            <CakeSliceArt className="bg-shape bg-shape--cake" />
            <SquiggleArt className="bg-shape bg-shape--squiggle" />
            <span className="bg-shape bg-shape--dot bg-shape--dot-a" />
            <span className="bg-shape bg-shape--dot bg-shape--dot-b" />
            <span className="bg-shape bg-shape--dot bg-shape--dot-c" />
          </div>
        </div>

        <Marquee items={weekItems} />

        <header className="site-header">
          <div className="header-inner">
            <a href="#top" className="brand">
              <span className="brand__sticker">
                <CakeDoodle className="h-7 w-7" />
              </span>
              <span className="brand__slab">Birthday Tracker</span>
            </a>

            <nav aria-label="Page sections" className="nav">
              <a className="nav-pill" href="#upload">
                Upload
              </a>
              {contacts.length > 0 && (
                <>
                  <a className="nav-pill" href="#calendar">
                    Calendar
                  </a>
                  <a className="nav-pill" href="#birthdays">
                    Birthdays
                  </a>
                </>
              )}
            </nav>

            <a href="#upload" className="btn btn--primary btn--sm" aria-label="Add birthdays">
              <span className="hidden sm:inline">Add birthdays</span>
              <Plus className="h-5 w-5 sm:hidden" aria-hidden="true" />
            </a>
          </div>
        </header>

        <main className="page">
          <h1 className="sr-only">Birthday Tracker</h1>

          {nextUp ? (
            <NextUpPoster next={nextUp} todayCount={todayCount} />
          ) : (
            <section className="intro">
              <h2 className="intro__title">Never Miss a Big Day.</h2>
              <div className="intro__underline" aria-hidden="true" />
              <p className="intro__text">
                Add a spreadsheet of names and birthdays, and every one lands on the
                calendar, ready to celebrate.
              </p>
            </section>
          )}

          {parseError && (
            <div className="alert" role="alert">
              <span className="alert__icon" aria-hidden="true">
                !
              </span>
              <p className="alert__text">{parseError}</p>
              <button
                type="button"
                aria-label="Dismiss error message"
                onClick={() => setParseError(null)}
                className="btn btn--icon btn--sm"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <section id="upload" className="section">
            <div className="section-head">
              <h2 className="section-title">Your birthday list</h2>
              {contacts.length > 0 ? (
                <span className="chip chip--yellow">
                  {contacts.length} {contacts.length === 1 ? 'birthday' : 'birthdays'} saved
                </span>
              ) : (
                <span className="chip chip--pink">Start here</span>
              )}
            </div>

            <FileUpload onFileUpload={handleFileUpload} />
          </section>

          {contacts.length > 0 && (
            <>
              <section id="reminders" className="section" aria-label="Birthday reminders">
                <div className="plate">
                  <div className="plate__band" aria-hidden="true" />
                  <div className="plate__body">
                    <div className="reminder__row">
                      <div className="reminder__identity">
                        <span className={`reminder__icon${notificationsEnabled ? ' is-on' : ''}`}>
                          {notificationsEnabled ? (
                            <BellRing className="h-7 w-7" aria-hidden="true" />
                          ) : (
                            <Bell className="h-6 w-6" aria-hidden="true" />
                          )}
                        </span>

                        <div className="min-w-0">
                          <h2 className="reminder__title">Birthday reminders</h2>
                          <p className="reminder__text">
                            {notificationsEnabled
                              ? 'You will receive notifications 1 day before each birthday'
                              : 'Get notified 1 day before upcoming birthdays'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={notificationsEnabled ? handleDisableNotifications : handleEnableNotifications}
                        disabled={!isNative()}
                        aria-pressed={notificationsEnabled}
                        className={`btn${notificationsEnabled ? '' : ' btn--primary'}`}
                      >
                        {notificationsEnabled ? 'Disable reminders' : 'Enable reminders'}
                      </button>
                    </div>

                    {!isNative() && (
                      <div className="reminder__note">
                        <Sparkle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <p className="m-0">
                          Reminders are not available in the web version yet. The mobile app
                          notifies you a day before each birthday.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section id="calendar" className="section">
                <div className="section-head">
                  <h2 className="section-title">Pick a day</h2>
                  <span className="chip">Days with a dot have birthdays</span>
                </div>

                <div ref={datePickerRef}>
                  <DatePicker
                    onDateSelect={handleDateSelect}
                    selectedDate={selectedDate}
                    contacts={contacts}
                  />
                </div>
              </section>

              <section
                id="birthdays"
                className="section"
                aria-label="Birthdays on the selected date"
              >
                <ContactList contacts={filteredContacts} selectedDate={selectedDate} />
              </section>
            </>
          )}

          {contacts.length === 0 && (
            <section className="section" aria-label="Getting started">
              <div className="empty">
                <CakeSliceArt className="empty__art" />
                <h2 className="empty__title">No birthdays yet</h2>
                <p className="empty__text">
                  Add the first one with a spreadsheet of names and dates.
                </p>
                <a href="#upload" className="btn btn--primary">
                  Add birthday
                </a>
              </div>

              <div className="plate mt-8">
                <div className="plate__band" aria-hidden="true" />
                <div className="plate__body">
                  <h3 className="section-title">How it works</h3>
                  <ol className="steps">
                    {HOW_TO_STEPS.map((step, index) => (
                      <li key={step} className="step">
                        <span className="step__num" aria-hidden="true">
                          {index + 1}
                        </span>
                        <span className="step__text">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          )}
        </main>

        <footer className="site-footer">
          <div className="site-footer__band" aria-hidden="true" />
          <div className="site-footer__inner">
            <span className="site-footer__brand">Birthday Tracker</span>
            <p className="site-footer__text">
              Upload a list, pick a day, celebrate. Your list stays on this device.
            </p>
          </div>
        </footer>
      </div>

      {showNotificationBanner && notificationStatus && (
        <div className={`toast ${notificationDenied ? 'toast--error' : 'toast--success'}`} role="status">
          <span className="toast__icon">
            {notificationDenied ? (
              <BellOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Check className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <p className="toast__text">
            {notificationDenied
              ? 'Notification permission denied. Turn it on in your device settings to get birthday reminders.'
              : `${notificationStatus.scheduled} reminder${notificationStatus.scheduled !== 1 ? 's' : ''} scheduled. You'll be notified a day before each birthday at 9:00 AM.`}
          </p>
          <button
            type="button"
            aria-label="Dismiss notification message"
            onClick={() => setShowNotificationBanner(false)}
            className="toast__close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}

export default App;
