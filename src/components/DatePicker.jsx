import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const isToday = (date) => {
    if (!date) return false;
    const now = new Date();
    return date.getDate() === now.getDate() &&
           date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
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
    <div className="cal">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="cal__trigger"
      >
        <span className="cal__trigger-main">
          <span className="cal__icon">
            <Calendar className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="cal__label">Birthdays on</span>
            <span className="cal__date">{formatSelectedDate()}</span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-2">
          <span className="hidden text-sm font-bold sm:block">
            {isOpen ? 'Close' : 'Open'}
          </span>
          <ChevronRight
            className={`cal__chevron${isOpen ? ' is-open' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose a date to see birthdays"
          className="cal__pop"
        >
          <div className="cal__pop-strip" aria-hidden="true" />

          <div className="cal__pop-head">
            <button
              type="button"
              onClick={handlePreviousMonth}
              aria-label="Previous month"
              className="btn btn--icon btn--sm"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <h3 className="cal__month">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="btn btn--icon btn--sm"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="cal__body">
            <div className="cal__weekdays">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="cal__weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="cal__days">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={!date}
                  data-empty={!date ? 'true' : undefined}
                  data-birthday={hasBirthday(date) ? 'true' : undefined}
                  data-selected={isSelectedDate(date) ? 'true' : undefined}
                  data-today={isToday(date) ? 'true' : undefined}
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
                  <span>{date ? date.getDate() : ''}</span>
                </button>
              ))}
            </div>

            <div className="cal__legend">
              <span className="cal__legend-item">
                <span className="cal__swatch cal__swatch--birthday" aria-hidden="true" />
                has a birthday
              </span>
              <span className="cal__legend-item">
                <span className="cal__swatch cal__swatch--selected" aria-hidden="true" />
                selected
              </span>
              <span className="cal__legend-item">
                <span className="cal__swatch cal__swatch--today" aria-hidden="true" />
                today
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
