import { Cake } from 'lucide-react';
import { Balloon, CakeDoodle, Confetti, PartyHat, Sparkle, Swirl, Heart } from './Doodles';

const TILTS = ['tilt-a', 'tilt-b', 'tilt-c', 'tilt-d', 'tilt-e', 'tilt-f'];
const PHOTO_TINTS = ['bg-baby-blue-soft', 'bg-sunshine-soft', 'bg-paper-shade'];

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const isSameDay = (a, b) =>
  !!a && !!b && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Presentational only: derives "days left", "is today" and the age being turned. */
const getTurnInfo = (birthDate) => {
  const today = startOfToday();
  const thisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  const next = thisYear < today
    ? new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
    : thisYear;

  const daysLeft = Math.round((next - today) / 86400000);
  const age = next.getFullYear() - birthDate.getFullYear();

  return {
    daysLeft,
    isToday: daysLeft === 0,
    age: Number.isFinite(age) && age > 0 && age < 130 ? age : null,
  };
};

const ContactList = ({ contacts, selectedDate }) => {
  const today = startOfToday();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full mx-auto">
      {selectedDate && (
        <div className="animate-rise mb-7 flex flex-wrap items-center gap-3">
          <div className="section-heading">
            <Cake className="h-6 w-6 shrink-0 text-red" aria-hidden="true" />
            <h2 className="font-brush text-xl text-ink sm:text-2xl">
              Birthdays on {formatDate(selectedDate)}
            </h2>
          </div>
          {isSameDay(selectedDate, today) && (
            <span className="sticker sticker-red sticker-wiggle rotate-[-4deg]">
              Today! let&apos;s party
            </span>
          )}
        </div>
      )}

      {contacts.length === 0 && selectedDate ? (
        <div className="animate-rise note relative overflow-hidden px-6 py-12 text-center sm:px-12">
          <Sparkle className="doodle doodle-twinkle left-6 top-6 h-5 w-5 text-red" />
          <Sparkle className="doodle doodle-twinkle right-8 top-10 h-4 w-4 text-ink/40" />

          <div className="relative mx-auto mb-4 w-24">
            <Balloon className="doodle-float mx-auto h-24 w-24 text-baby-blue-deep" />
            <Swirl className="doodle -bottom-2 -right-6 h-10 w-10 text-ink/35" />
          </div>

          <h3 className="font-marker rotate-[-2deg] text-2xl text-red sm:text-3xl">
            No cake on this day :(
          </h3>
          <p className="font-hand mt-2 text-2xl font-bold text-ink">
            the page is empty — pick another date!
          </p>
          <p className="mx-auto mt-3 max-w-xs text-sm text-ink/75">
            No contacts have a birthday on this date.
          </p>
        </div>
      ) : contacts.length > 0 ? (
        <ul className="grid grid-cols-1 gap-7 pt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {contacts.map((contact, index) => {
            const { daysLeft, isToday, age } = getTurnInfo(contact.birthDate);
            const badgeLabel = isToday
              ? 'Today!'
              : daysLeft === 1
                ? 'Tomorrow'
                : `${daysLeft} days left`;
            const badgeClass = isToday
              ? 'sticker sticker-red'
              : daysLeft <= 7
                ? 'sticker'
                : 'sticker sticker-paper';

            return (
              <li
                key={`${contact.name}-${index}`}
                className={`polaroid ${TILTS[index % TILTS.length]} ${isToday ? 'is-today' : ''}`}
                style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
              >
                <span className="tape" aria-hidden="true" />

                <div className={`polaroid-photo ${PHOTO_TINTS[index % PHOTO_TINTS.length]}`}>
                  <span
                    className="font-marker text-5xl text-ink/85 select-none"
                    aria-hidden="true"
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </span>

                  <CakeDoodle className="absolute right-2.5 bottom-2 h-7 w-7 text-ink/45" />

                  {isToday ? (
                    <>
                      <PartyHat className="absolute left-2.5 top-2 h-9 w-9 rotate-[-12deg] text-red" />
                      <Confetti className="doodle doodle-twinkle right-1 top-1 h-10 w-10 text-red" />
                    </>
                  ) : (
                    <Sparkle className="absolute left-2.5 top-2 h-5 w-5 text-ink/35" />
                  )}

                  <span className={`${badgeClass} absolute right-2 top-2 rotate-[5deg] text-base`}>
                    {badgeLabel}
                  </span>
                </div>

                <div className="polaroid-caption">
                  <h3 className="font-marker text-lg leading-tight text-red break-words">
                    {contact.name}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="label-serif text-[0.6rem] text-ink/70">
                      {contact.birthDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    {age !== null && (
                      <span className="font-hand text-lg font-bold text-ink">
                        turns {age}
                      </span>
                    )}
                  </div>

                  {isToday && (
                    <span className="sticker sticker-paper sticker-sm mt-2 rotate-[-2deg]">
                      wish them well <Heart className="h-3.5 w-3.5 text-red" />
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!selectedDate && (
        <div className="mt-8 text-center">
          <div className="note note-sm inline-flex items-center gap-2">
            <Sparkle className="h-4 w-4 text-red" />
            <p className="font-hand text-xl font-bold text-ink">
              pick a date up there to see who&apos;s celebrating
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactList;
