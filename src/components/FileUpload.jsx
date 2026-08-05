import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !fileName && fileInputRef.current?.click()}
        className={`
          brutal-border brutal-shadow bg-surface p-12 cursor-pointer
          transition-all duration-100
          ${isDragging ? 'bg-accent-secondary translate-x-1 translate-y-1 shadow-none' : ''}
          ${!isDragging && fileName ? 'bg-success' : ''}
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
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <FileSpreadsheet className="w-16 h-16 text-ink" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="brutal-button bg-accent-primary text-ink p-1 absolute -top-3 -right-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <p className="font-mono text-ink font-bold text-lg uppercase tracking-wide">{fileName}</p>
              <div className="brutal-border-thin bg-bg px-3 py-1 mt-2 inline-block">
                <p className="font-mono text-ink text-xs uppercase">File uploaded successfully</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className={`transition-transform duration-100 ${isDragging ? 'translate-x-1 translate-y-1' : ''}`}>
              <Upload className={`w-16 h-16 text-ink`} />
            </div>
            <div className="text-center">
              <p className="font-display text-ink text-xl uppercase tracking-tight">
                {isDragging ? 'Drop your file here' : 'Upload Excel File'}
              </p>
              <div className="brutal-border-thin bg-accent-tertiary px-4 py-2 mt-3 inline-block">
                <p className="font-mono text-ink text-sm uppercase tracking-wide font-bold">
                  Drag & drop or click to select
                </p>
              </div>
              <p className="font-mono text-ink text-xs uppercase tracking-wide mt-3">
                Supports .xlsx, .xls, and .csv files
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
