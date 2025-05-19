import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const ChatMessage = ({ role, content }) => {
  const isUser = role === 'user';
  const bgColor = isUser ? 'bg-blue-100' : 'bg-emerald-100';
  const textColor = isUser ? 'text-blue-800' : 'text-emerald-800';
  const alignment = isUser ? 'items-end' : 'items-start';
  const icon = isUser ? '👤' : '🤖';
  
  return (
    <div className={`flex ${alignment} w-full my-3`}>
      <div className={`max-w-[85%] rounded-lg p-4 ${bgColor} shadow-md border border-opacity-20 ${isUser ? 'border-blue-200' : 'border-emerald-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">{icon}</span>
          <div className={`text-sm font-medium capitalize ${textColor}`}>{role}</div>
          <div className="text-xs text-gray-500 ml-auto">
            <Clock className="w-3 h-3 inline mr-1" />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className={`text-sm ${isUser ? 'text-gray-800' : 'text-gray-700'}`}>{content}</div>
      </div>
    </div>
  );
};

const Conversation = ({ events }) => {
  const [chatMessages, setChatMessages] = useState([]);
  console.log('events', events);
  useEffect(() => {
    const processEvents = () => {
      const messageBuffer = new Map();
      const transcriptBuffer = new Map();
      const assistantBuffer = new Map();
      
      // Process events in reverse chronological order to maintain correct order
      [...events].reverse().forEach(event => {
        // Handle user messages
        if (event.type === 'conversation.item.created') {
          const item = event.item;
          if (item && (item.role === 'user' || item.role === 'assistant')) {
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

        // Handle assistant text messages from audio transcripts
        if (event.type === 'response.audio_transcript.done' && event.transcript) {
          const itemId = event.item_id;
          assistantBuffer.set(itemId, event.transcript);
        }

        // Handle assistant text messages from output items
        if (event.type === 'response.output_item.done') {
          const item = event.item;
          if (item && item.role === 'assistant' && item.content && item.content.length > 0) {
            const itemId = item.id;
            const transcript = item.content.find(c => c.type === 'audio')?.transcript;
            if (transcript && !assistantBuffer.has(itemId)) {
              assistantBuffer.set(itemId, transcript);
            }
          }
        }
      });

      // Create messages array from user messages
      const newChatMessages = Array.from(messageBuffer.entries())
        .map(([itemId, message]) => {
          if (transcriptBuffer.has(itemId) && message.role === 'user') {
            message.content = transcriptBuffer.get(itemId);
          }
          if (assistantBuffer.has(itemId) && message.role === 'assistant') {
            message.content = assistantBuffer.get(itemId);
          }
          return message;
        })
        .filter(message => message.content && message.content.trim())
        .sort((a, b) => {
          // Sort by original creation order
          const aEvent = events.find(e => e.item?.id === a.itemId);
          const bEvent = events.find(e => e.item?.id === b.itemId);
          return events.indexOf(bEvent) - events.indexOf(aEvent); // Reverse the sort order
        });

      setChatMessages(newChatMessages);
    };

    processEvents();
  }, [events]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 w-full">
      <div className="w-full p-4 overflow-y-auto bg-white">
        <div className="flex flex-col space-y-2">
          {chatMessages.length > 0 ? (
            chatMessages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              No messages to display
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversation;