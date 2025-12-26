import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
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

  const processFile = (file) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    console.log('Processing file:', file.name, 'Extension:', fileExtension);
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Please upload a valid Excel or CSV file');
      return;
    }

    setFileName(file.name);
    console.log('Calling onFileUpload with file:', file.name);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !fileName && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 
          transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-primary-500 bg-primary-50/50 scale-105' 
            : fileName
            ? 'border-green-400 bg-green-50/30'
            : 'border-slate-300 bg-white/60 hover:border-primary-400 hover:bg-primary-50/30'
          }
          backdrop-blur-sm shadow-lg hover:shadow-xl
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="relative">
              <FileSpreadsheet className="w-16 h-16 text-green-500" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-medium text-lg">{fileName}</p>
              <p className="text-slate-500 text-sm mt-1">File uploaded successfully</p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Upload className={`w-16 h-16 ${isDragging ? 'text-primary-500' : 'text-slate-400'}`} />
            </motion.div>
            <div className="text-center">
              <p className="text-slate-700 font-medium text-lg mb-2">
                {isDragging ? 'Drop your file here' : 'Upload Excel File'}
              </p>
              <p className="text-slate-500 text-sm">
                Drag and drop or click to select
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Supports .xlsx, .xls, and .csv files
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FileUpload;
