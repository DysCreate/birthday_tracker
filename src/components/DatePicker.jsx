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
        onClick={() => setIsOpen(!isOpen)}
        className="brutal-button brutal-shadow w-full px-6 py-4 bg-surface flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-ink shrink-0" />
          <span className="font-body font-bold text-ink uppercase tracking-wide">{formatSelectedDate()}</span>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-ink transition-transform duration-100 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="animate-slap absolute top-full mt-2 w-full bg-surface brutal-border brutal-shadow-lg z-50">
          <div className="flex items-center justify-between px-6 py-4 brutal-border-thin" style={{ borderBottomWidth: '3px' }}>
            <button
              onClick={handlePreviousMonth}
              className="brutal-button bg-bg p-2"
            >
              <ChevronLeft className="w-5 h-5 text-ink" />
            </button>

            <h3 className="font-display text-ink text-lg uppercase tracking-tight">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>

            <button
              onClick={handleNextMonth}
              className="brutal-button bg-bg p-2"
            >
              <ChevronRight className="w-5 h-5 text-ink" />
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center font-mono text-ink font-bold text-xs py-2 uppercase tracking-wide">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={!date}
                  className={`
                    aspect-square flex flex-col items-center justify-center text-sm font-bold relative
                    transition-all duration-100
                    ${!date ? 'invisible' : ''}
                    ${isSelectedDate(date)
                      ? 'bg-accent-primary text-ink brutal-border-thin'
                      : hasBirthday(date)
                        ? 'bg-accent-tertiary text-ink brutal-border-thin'
                        : 'bg-bg text-ink hover:bg-accent-secondary hover:text-white'
                    }
                  `}
                  style={isSelectedDate(date) ? { boxShadow: '3px 3px 0px 0px #111' } : {}}
                >
                  <span className="font-mono font-bold">{date ? date.getDate() : ''}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
