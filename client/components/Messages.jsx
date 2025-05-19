import React from 'react';

export const ChatMessage = ({ role, content }) => {
  const isUser = role === 'user';
  
  const messageClass = isUser 
    ? "bg-blue-100 text-blue-900 ml-auto" 
    : "bg-gray-100 text-gray-900";
    
  const containerClass = isUser
    ? "flex justify-end"
    : "flex justify-start";

  return (
    <div className={containerClass}>
      <div className={`rounded-lg px-4 py-2 max-w-[80%] ${messageClass}`}>
        {Array.isArray(content) 
          ? content.map((item, i) => {
              if (item.type === 'input_text') {
                return <p key={i}>{item.text}</p>;
              } else {
                return <p key={i}>[Unsupported content type]</p>;
              }
            })
          : <p>{content}</p>
        }
      </div>
    </div>
  );
};

export default function Messages({ messages }) {
  return (
    <div className="space-y-3 w-full">
      {messages.map((message, index) => (
        <ChatMessage 
          key={index} 
          role={message.role} 
          content={message.content}
        />
      ))}
    </div>
  );
}
