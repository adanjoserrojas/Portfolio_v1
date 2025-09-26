// components/ChatContainer.tsx
'use client';

import { User, Bot } from 'lucide-react';
import { motion, AnimatePresence, backInOut, backIn } from "framer-motion";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date | string; // allow string from JSON
}

interface ChatContainerProps {
  messages?: Message[];       // allow undefined from parent
  isLoading?: boolean;
  isVisible?: boolean;
}

// components/ChatContainer.tsx
export default function ChatContainer({
  messages = [],
  isLoading = false,
  isVisible = true,
}: ChatContainerProps) {
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
      {safeMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-darkBeige h-full">

          {isVisible && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: backInOut }}>
            <Bot className="w-12 h-12 mx-auto mb-4 text-darkBeige" />
          </motion.div>
          )}          
            <div className="opacity-50">
              Ask me any questions you want!
            </div>
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                  message.isUser
                    ? 'bg-Black-100 text-darkBeige'
                    : 'bg-Laguna text-darkBeige'
                }`}
              >
                <div className= "flex items-start">
                  {!message.isUser}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  {message.isUser}
                </div>
              </div>
            </div>
          );
        })
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-transparent text-darkBeige max-w-xs px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-Beige rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-Beige rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-Beige rounded-full animate-bounce"
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
