import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import FileUpload from './components/FileUpload';
import DatePicker from './components/DatePicker';
import ContactList from './components/ContactList';
import { Sparkles } from 'lucide-react';

function App() {
  const [contacts, setContacts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const datePickerRef = useRef(null);

  // Scroll to date picker when contacts are loaded
  useEffect(() => {
    if (contacts.length > 0 && datePickerRef.current) {
      setTimeout(() => {
        datePickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [contacts]);

  const parseDate = (dateValue) => {
    if (!dateValue) return null;

    // If it's already a Date object
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    // If it's an Excel serial number
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      return isNaN(date.getTime()) ? null : date;
    }

    // If it's a string, ONLY accept DD-MM-YYYY format
    if (typeof dateValue === 'string') {
      const trimmed = dateValue.trim();
      
      // Match DD-MM-YYYY format (with - or / separators)
      const ddmmyyyyPattern = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
      const match = trimmed.match(ddmmyyyyPattern);
      
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        
        // Validate the date components
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const date = new Date(year, month - 1, day);
          // Double-check the date is valid (handles invalid dates like Feb 31)
          if (date.getDate() === day && date.getMonth() === month - 1) {
            return date;
          }
        }
      }
      
      return null;
    }

    return null;
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      setContacts([]);
      setFilteredContacts([]);
      setSelectedDate(null);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Read without headers first to check the data
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Check if first row looks like headers or data
        const firstRow = jsonData[0];
        const hasHeaders = firstRow && firstRow.length >= 2 && 
                          (String(firstRow[0]).toLowerCase().includes('name') || 
                           String(firstRow[1]).toLowerCase().includes('birth') ||
                           String(firstRow[1]).toLowerCase().includes('date'));
        
        // Start from row 1 if headers exist, otherwise row 0
        const startRow = hasHeaders ? 1 : 0;
        
        const parsedContacts = jsonData
          .slice(startRow)
          .map((row, index) => {
            if (!row || row.length < 2) {
              return null;
            }
            
            const name = row[0];
            const dateValue = row[1];
            
            if (!name || !dateValue) {
              return null;
            }

            const birthDate = parseDate(dateValue);
            if (!birthDate) {
              return null;
            }

            return {
              name: String(name).trim(),
              birthDate: birthDate
            };
          })
          .filter(contact => contact !== null);

        setContacts(parsedContacts);
        
        // Automatically select today's date to show birthdays
        const today = new Date();
        setSelectedDate(today);
        
        // Filter contacts for today's birthdays
        const todayBirthdays = parsedContacts.filter(contact => {
          return contact.birthDate.getMonth() === today.getMonth() &&
                 contact.birthDate.getDate() === today.getDate();
        });
        setFilteredContacts(todayBirthdays);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please make sure it contains "Name" and "BirthDate" columns.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    
    // Filter contacts by month and day (ignore year)
    const filtered = contacts.filter(contact => {
      return contact.birthDate.getMonth() === date.getMonth() &&
             contact.birthDate.getDate() === date.getDate();
    });

    setFilteredContacts(filtered);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Birthday Tracker
            </h1>
      
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Never miss a birthday again
          </p>
        </motion.div>

        {/* File Upload */}
        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        {/* Date Picker - Only show when contacts are loaded */}
        {contacts.length > 0 && (
          <motion.div
            ref={datePickerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <DatePicker 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              autoOpen={true}
              contacts={contacts}
            />
          </motion.div>
        )}

        {/* Contact List */}
        {contacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ContactList 
              contacts={filteredContacts}
              selectedDate={selectedDate}
            />
          </motion.div>
        )}

        {/* Instructions - Only show when no file is uploaded */}
        {contacts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200"
          >
            <h3 className="text-xl font-semibold text-slate-700 mb-4">
              How to use:
            </h3>
            <ol className="space-y-3 text-slate-600">
              <li className="flex items-start">
                <span className="font-semibold text-primary-600 mr-3">1.</span>
                <span>Prepare an Excel file with columns named "Name" and "BirthDate"</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-primary-600 mr-3">2.</span>
                <span>Upload your file using the drag-and-drop zone above</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-primary-600 mr-3">3.</span>
                <span>Select a date from the calendar to view birthdays</span>
              </li>
            </ol>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
