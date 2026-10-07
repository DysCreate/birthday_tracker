import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { CakeDoodle, Sparkle } from './Doodles';

const FileUpload = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const VALID_MIME_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/csv',
  ];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const processFile = (file) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      alert('Please upload a valid Excel or CSV file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum size is 10MB.');
      return;
    }

    if (file.type && !VALID_MIME_TYPES.includes(file.type)) {
      alert('Invalid file type. Please upload an Excel or CSV file.');
      return;
    }

    setFileName(file.name);
    onFileUpload(file);
  };

  const handleClearFile = () => {
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileUpload(null);
  };

  const openPicker = () => {
    if (!fileName) fileInputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <span className={`tape tape-wide ${fileName ? 'tape-red' : ''}`} aria-hidden="true" />

        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a spreadsheet of birthdays: drag and drop or press Enter to browse for an .xlsx, .xls or .csv file"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          className={`dropzone animate-rise px-6 py-10 sm:px-10 sm:py-12 text-center
            ${isDragging ? 'is-dragging' : ''}
            ${!isDragging && fileName ? 'is-loaded' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {fileName ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <FileSpreadsheet className="w-14 h-14 text-ink" aria-hidden="true" />
                <button
                  type="button"
                  aria-label={`Remove ${fileName} and clear all birthdays`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="btn btn-primary btn-icon absolute -top-3 -right-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="font-hand text-2xl font-bold text-ink break-all">{fileName}</p>
                <span className="sticker sticker-red mt-3">
                  ✓ saved to this device
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`relative transition-transform ${isDragging ? 'scale-110' : ''}`}>
                <CakeDoodle className="w-16 h-16 text-red" />
                <Upload className="w-5 h-5 text-ink absolute -right-3 -bottom-1" aria-hidden="true" />
                <Sparkle className="w-4 h-4 text-red absolute -left-4 top-0 doodle-twinkle" />
              </div>

              <div>
                <p className="font-hand text-3xl font-bold text-ink leading-tight">
                  {isDragging ? 'Drop it right here!' : 'Stick your birthday list here'}
                </p>
                <p className="text-sm text-ink/80 mt-2">
                  Drag &amp; drop — or click to pick a file. Enter works too.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="sticker sticker-paper sticker-wiggle">.xlsx</span>
                <span className="sticker sticker-paper sticker-wiggle">.xls</span>
                <span className="sticker sticker-paper sticker-wiggle">.csv</span>
                <span className="label-serif text-[0.62rem] text-ink/70">max 10 MB</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
