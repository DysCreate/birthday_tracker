import { Cake } from 'lucide-react';

const ContactList = ({ contacts, selectedDate }) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full mx-auto">
      {selectedDate && (
        <div className="mb-6 animate-slap">
          <div className="bg-accent-tertiary brutal-border-thin px-5 py-3 inline-block -rotate-1">
            <h2 className="font-display text-ink text-xl sm:text-2xl uppercase tracking-tight flex items-center gap-3">
              <Cake className="w-7 h-7 text-ink shrink-0" />
              Birthdays on {formatDate(selectedDate)}
            </h2>
          </div>
        </div>
      )}

      {contacts.length === 0 && selectedDate ? (
        <div className="animate-slap bg-surface brutal-border brutal-shadow-lg p-12 text-center">
          <div className="w-16 h-16 brutal-border-thin bg-bg flex items-center justify-center mx-auto mb-4 -rotate-3">
            <span className="font-display text-ink text-3xl">:/</span>
          </div>
          <h3 className="font-display text-ink text-2xl uppercase tracking-tight mb-2">
            No Birthdays Found
          </h3>
          <div className="brutal-border-thin bg-accent-tertiary px-4 py-2 inline-block">
            <p className="font-mono text-ink text-sm uppercase font-bold">
              No contacts have a birthday on this date
            </p>
          </div>
        </div>
      ) : contacts.length > 0 ? (
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <div
              key={`${contact.name}-${index}`}
              className="animate-slap bg-surface brutal-border brutal-shadow"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 brutal-border-thin bg-accent-secondary flex items-center justify-center shrink-0 -rotate-3">
                    <span className="font-display text-white text-xl">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-ink text-xl uppercase tracking-tight truncate">
                      {contact.name}
                    </h3>
                    <div className="brutal-border-thin bg-bg px-3 py-1 mt-1 inline-block">
                      <p className="font-mono text-ink text-xs uppercase font-bold tracking-wide">
                        {contact.birthDate.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 brutal-border-thin bg-accent-tertiary flex items-center justify-center shrink-0 rotate-3">
                  <Cake className="w-5 h-5 text-ink" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!selectedDate && (
        <div className="text-center mt-8">
          <div className="brutal-border-thin bg-bg px-6 py-3 inline-block">
            <p className="font-mono text-ink text-sm uppercase font-bold tracking-wide">Select a date to view birthdays</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactList;
