import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

const EventLog = ({ events }) => {
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const messageBuffer = new Map();
    const transcriptBuffer = new Map();

    [...events].reverse().forEach(event => {
      // Only handle user messages
      if (event.type === 'conversation.item.created') {
        const item = event.item;
        if (item && item.role === 'user') {
          const itemId = item.id;
          if (!messageBuffer.has(itemId)) {
            messageBuffer.set(itemId, {
              role: item.role,
              content: '',
              timestamp: event.timestamp,
              status: item.status,
              itemId
            });
          }
        }
      }
      // Handle user audio transcriptions
      if (event.type === 'conversation.item.input_audio_transcription.completed' && event.transcript) {
        const itemId = event.item_id;
        transcriptBuffer.set(itemId, event.transcript.trim());
      }
    });

    const newChatMessages = Array.from(messageBuffer.entries())
      .map(([itemId, message]) => {
        if (transcriptBuffer.has(itemId)) {
          message.content = transcriptBuffer.get(itemId);
        }
        return message;
      })
      .filter(message => message.content && message.content.trim())
      .sort((a, b) => {
        const aEvent = events.find(e => e.item?.id === a.itemId);
        const bEvent = events.find(e => e.item?.id === b.itemId);
        return events.indexOf(bEvent) - events.indexOf(aEvent);
      });

    setChatMessages(newChatMessages);
  }, [events]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 pr-0 overflow-y-auto">
        <div className="mx-auto bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden h-full">
          {chatMessages.length > 0 ? (
            <div className="p-6 bg-white text-gray-800 h-full overflow-y-auto" style={{ fontFamily: 'Georgia, serif' }}>
              {chatMessages.map(message => message.content).join(' ')}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 h-full flex flex-col items-center justify-center">
              <FileText className="h-10 w-10 mb-2 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventLog;