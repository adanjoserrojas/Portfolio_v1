// components/ChatContainer.tsx
'use client';

import { User, Bot } from 'lucide-react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date | string; // allow string from JSON
}

interface ChatContainerProps {
  messages?: Message[];       // allow undefined from parent
  isLoading?: boolean;
}

// components/ChatContainer.tsx
export default function ChatContainer({
  messages = [],
  isLoading = false,
}: ChatContainerProps) {
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {safeMessages.length === 0 ? (
        <div className="flex items-center justify-center text-darkBeige h-full">
            <Bot className="w-12 h-12 mx-auto mb-4 text-darkBeige" />
        </div>
      ) : (
        safeMessages.map((message) => {
          const date =
            message.timestamp instanceof Date
              ? message.timestamp
              : new Date(message.timestamp);

          return (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {!message.isUser && <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {isNaN(date.getTime()) ? '' : date.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.isUser && <User className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                </div>
              </div>
            </div>
          );
        })
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-200 text-gray-800 max-w-xs px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
