import { useState, useRef } from 'react';
import { Check, FileSpreadsheet, Upload, X } from 'lucide-react';
import { CakeDoodle } from './Doodles';

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
    <div className="invite">
      <span className="tape" aria-hidden="true" />

      <div className="invite__inner">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a spreadsheet of birthdays: drag and drop or press Enter to browse for an .xlsx, .xls or .csv file"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          className={`dropzone${isDragging ? ' is-dragging' : ''}${
            !isDragging && fileName ? ' is-loaded' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {fileName ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <FileSpreadsheet className="h-14 w-14" aria-hidden="true" />
                <button
                  type="button"
                  aria-label={`Remove ${fileName} and clear all birthdays`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="btn btn--primary btn--icon absolute -top-3 -right-5"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <p className="dropzone__file">{fileName}</p>
              <span className="chip chip--green">
                <Check className="h-4 w-4" aria-hidden="true" />
                Saved on this device
              </span>
            </div>
          ) : (
            <div>
              <div className="dropzone__icon">
                <CakeDoodle className="h-16 w-16" />
                <Upload
                  className="absolute -right-4 -bottom-1 h-5 w-5 text-[color:var(--text)]"
                  aria-hidden="true"
                />
              </div>

              <p className="dropzone__title">
                {isDragging ? 'Drop it right here' : 'Drop your birthday list here'}
              </p>
              <p className="dropzone__hint">
                Drag and drop, or choose a file. .xlsx, .xls or .csv, up to 10 MB.
              </p>

              <div className="dropzone__formats">
                <span className="format-tag">.xlsx</span>
                <span className="format-tag">.xls</span>
                <span className="format-tag">.csv</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
