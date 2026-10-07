import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { CakeDoodle } from './Doodles';

const DatePicker = ({ onDateSelect, selectedDate, contacts = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const birthdayDaysInMonth = useMemo(() => {
    const month = currentMonth.getMonth();
    const days = new Set();
    contacts.forEach((contact) => {
      if (contact.birthDate.getMonth() === month) {
        days.add(contact.birthDate.getDate());
      }
    });
    return days;
  }, [contacts, currentMonth]);

  const hasBirthday = (date) => {
    if (!date) return false;
    return birthdayDaysInMonth.has(date.getDate());
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    if (date) {
      onDateSelect(date);
      setIsOpen(false);
    }
  };

  const isSelectedDate = (date) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth();
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return 'Select a date';
    return selectedDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative w-full mx-auto">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="group flex w-full items-center justify-between gap-3 rounded-2xl border-[3px] border-ink bg-paper px-4 py-3.5 text-left shadow-sticker-lg
                   transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-sticker-lg"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 rotate-[-5deg] items-center justify-center rounded-xl border-2 border-ink transition-colors duration-200 ${
              isOpen ? 'bg-red' : 'bg-sunshine'
            }`}
          >
            <Calendar className={`h-5 w-5 ${isOpen ? 'text-white' : 'text-ink'}`} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="label-serif block text-[0.58rem] text-ink/70">birthdays on</span>
            <span className="font-hand block truncate text-2xl font-bold leading-tight text-ink">
              {formatSelectedDate()}
            </span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-2">
          <span className="label-serif hidden text-[0.58rem] text-ink/60 sm:block">
            {isOpen ? 'close' : 'open'}
          </span>
          <ChevronRight
            className={`h-5 w-5 text-ink transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose a date to see birthdays"
          className="animate-rise card absolute top-full z-50 mt-3 w-full overflow-hidden"
        >
          <span className="tape tape-red" aria-hidden="true" />

          <div className="flex items-center justify-between gap-2 border-b-[3px] border-dashed border-ink/30 px-3 py-3 sm:px-5">
            <button
              type="button"
              onClick={handlePreviousMonth}
              aria-label="Previous month"
              className="btn btn-sm btn-icon"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <h3 className="font-brush rotate-[-1.5deg] text-xl text-red sm:text-2xl">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="btn btn-sm btn-icon"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mx-auto w-full max-w-md bg-paper-warm/60 p-3 sm:p-4">
            <div className="mb-1.5 grid grid-cols-7 gap-1 sm:gap-1.5">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div
                  key={day}
                  className="label-serif py-1 text-center text-[0.55rem] text-ink/60"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={!date}
                  data-empty={!date ? 'true' : undefined}
                  data-birthday={hasBirthday(date) ? 'true' : undefined}
                  data-selected={isSelectedDate(date) ? 'true' : undefined}
                  aria-pressed={date ? isSelectedDate(date) : undefined}
                  aria-label={
                    date
                      ? `${date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}${hasBirthday(date) ? ' — has a birthday' : ''}`
                      : undefined
                  }
                  className="day-cell"
                >
                  <span className="text-[0.78rem] sm:text-sm">{date ? date.getDate() : ''}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t-[2px] border-dashed border-ink/25 pt-2.5">
              <span className="flex items-center gap-1.5 text-xs text-ink/75">
                <span className="h-2.5 w-2.5 rounded-full border border-ink bg-sunshine" aria-hidden="true" />
                has a birthday
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink/75">
                <span className="h-2.5 w-2.5 rounded-full border border-ink bg-red" aria-hidden="true" />
                selected
              </span>
              <CakeDoodle className="h-5 w-5 text-ink/40" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
