import React, { useState } from 'react';
import { Mic } from 'react-feather';

const RecordButton = ({ isDisabled, onRecordStart, onRecordStop }) => {
  const [isRecording, setIsRecording] = useState(true);

  const handleRecordClick = () => {
    if (isRecording) {
      setIsRecording(false);
      if (onRecordStop) onRecordStop();
    } else {
      setIsRecording(true);
      if (onRecordStart) onRecordStart();
    }
  };

  return (
    <div className="flex items-center justify-center flex-1">
      <button
        type="button"
        className={`relative flex items-center justify-center w-16 h-16 rounded-full focus:outline-none transition-colors duration-200
          ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleRecordClick}
        disabled={isDisabled}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <Mic color="#fff" size={32} />
        {isRecording && (
          <span className="absolute inline-block w-20 h-20 rounded-full opacity-60"></span>
        )}
      </button>
    </div>
  );
};

export default RecordButton;
