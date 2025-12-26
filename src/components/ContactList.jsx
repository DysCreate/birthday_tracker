import { motion, AnimatePresence } from 'framer-motion';
import { Cake, PartyPopper } from 'lucide-react';

const ContactList = ({ contacts, selectedDate }) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h2 className="text-2xl font-semibold text-slate-700 flex items-center justify-center gap-2">
            <Cake className="w-6 h-6 text-primary-600" />
            Birthdays on {formatDate(selectedDate)}
          </h2>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {contacts.length === 0 && selectedDate ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-slate-200"
          >
            <PartyPopper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">
              No Birthdays Found
            </h3>
            <p className="text-slate-500">
              No contacts have a birthday on this date
            </p>
          </motion.div>
        ) : contacts.length > 0 ? (
          <motion.div
            key="list"
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="space-y-3"
          >
            {contacts.map((contact, index) => (
              <motion.div
                key={`${contact.name}-${index}`}
                variants={item}
                layout
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-100 overflow-hidden group"
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg"
                    >
                      {contact.name.charAt(0).toUpperCase()}
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-primary-700 transition-colors">
                        {contact.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {contact.birthDate.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
                  >
                    <Cake className="w-6 h-6 text-primary-500" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!selectedDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-slate-500 mt-8"
        >
          <p className="text-lg">Select a date to view birthdays</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ContactList;
