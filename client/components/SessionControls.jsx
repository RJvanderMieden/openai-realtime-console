import { Square, Mic } from "lucide-react";

export default function SessionControls({
  startSession,
  stopSession,
  isSessionActive,
}) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center p-4 mr-4">
      {!isSessionActive && (
        <div className="flex flex-col items-center">
          <button
            onClick={startSession}
            className="w-16 h-16 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 transform hover:scale-105"
            type="button"
            aria-label="Start Recording"
            title="Start Recording"
          >
            <Mic size={28} />
          </button>
        </div>
      )}
      {isSessionActive && (
        <div className="flex flex-col items-center">
          <button
            onClick={stopSession}
            className="w-16 h-16 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 animate-pulse"
            type="button"
            aria-label="Stop Recording"
            title="Stop Recording"
          >
            <Square size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
