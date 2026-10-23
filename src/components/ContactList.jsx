import { BalloonCluster, CakeDoodle } from './Doodles';
import { getTurnInfo } from '../utils/birthdays';

const TILTS = [-2, 1.7, -1.2, 2.1, -1.6, 1.1];

const formatBirthDate = (date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const formatDay = (date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

const ContactList = ({ contacts, selectedDate }) => {
  return (
    <div className="w-full">
      {selectedDate && (
        <div className="section-head">
          <h2 className="section-title section-title--pink">
            Birthdays on {formatDay(selectedDate)}
          </h2>
          {contacts.length > 0 && (
            <span className="chip chip--yellow">
              {contacts.length} {contacts.length === 1 ? 'birthday' : 'birthdays'}
            </span>
          )}
        </div>
      )}

      {contacts.length === 0 && selectedDate ? (
        <div className="empty">
          <BalloonCluster className="empty__art" />
          <h3 className="empty__title">No birthdays on this day</h3>
          <p className="empty__text">
            Pick another date to see who&apos;s celebrating.
          </p>
          <a href="#calendar" className="btn btn--primary">
            Pick a date
          </a>
        </div>
      ) : contacts.length > 0 ? (
        <ul className="ticket-grid">
          {contacts.map((contact, index) => {
            const { daysLeft, isToday, age } = getTurnInfo(contact.birthDate);
            const tone = isToday
              ? 'today'
              : daysLeft <= 7
                ? 'week'
                : daysLeft <= 30
                  ? 'month'
                  : 'later';
            const band = isToday
              ? 'checks'
              : daysLeft <= 7
                ? 'stripes'
                : daysLeft <= 30
                  ? 'dots'
                  : 'checks';
            const badgeLabel = isToday
              ? 'Today'
              : daysLeft === 1
                ? 'Tomorrow'
                : `In ${daysLeft} days`;
            const note = isToday ? 'cake time!' : daysLeft === 1 ? 'tomorrow!' : null;

            return (
              <li
                key={`${contact.name}-${index}`}
                className={`ticket ticket--${tone}`}
                style={{
                  '--tilt': `${TILTS[index % TILTS.length]}deg`,
                  '--delay': `${Math.min(index, 12) * 30}ms`,
                }}
              >
                <div className={`ticket__band band--${band}`} aria-hidden="true" />

                <div className="ticket__plate">
                  <div className="ticket__top">
                    <h3 className="ticket__name">{contact.name}</h3>
                    {note && (
                      <span className="ticket__note" aria-hidden="true">
                        {note}
                      </span>
                    )}
                  </div>

                  <p className="ticket__date">{formatBirthDate(contact.birthDate)}</p>

                  <div className="ticket__meta">
                    <span className="days-pill">{badgeLabel}</span>

                    {age !== null && (
                      <span className="age-badge" role="img" aria-label={`Turns ${age}`}>
                        <span className="age-badge__label" aria-hidden="true">
                          turns
                        </span>
                        <span className="age-badge__num" aria-hidden="true">
                          {age}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!selectedDate && (
        <div className="empty">
          <CakeDoodle className="empty__art" />
          <h3 className="empty__title">Pick a date</h3>
          <p className="empty__text">
            Choose a day in the calendar to see who&apos;s celebrating.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactList;
