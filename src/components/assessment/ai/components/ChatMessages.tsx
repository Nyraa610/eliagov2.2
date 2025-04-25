
import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { Message } from '@/hooks/useEliaChat';
import { useAuthState } from '@/hooks/useAuthState';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessages({ messages, isLoading, messagesEndRef }: ChatMessagesProps) {
  const { user } = useAuthState();

  return (
    <>
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`mb-4 flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
        >
          {message.role === 'assistant' && (
            <Avatar className="mr-2 h-8 w-8">
              <div className="bg-emerald-700 text-white flex items-center justify-center h-full w-full rounded-full">
                <Sparkles className="h-4 w-4" />
              </div>
            </Avatar>
          )}
          
          <div 
            className={`max-w-[75%] rounded-lg p-3 ${
              message.role === 'assistant' 
                ? 'bg-muted text-foreground' 
                : 'bg-emerald-700 text-white'
            }`}
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs opacity-80">
                {message.role === 'assistant' ? 'Elia' : 'You'}
              </span>
              {message.tag && (
                <Badge 
                  variant="outline" 
                  className={`text-[0.6rem] px-1 py-0 ${
                    message.tag === 'esg' 
                      ? 'bg-green-100 text-green-800' 
                      : message.tag === 'app'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.tag}
                </Badge>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          
          {message.role === 'user' && (
            <Avatar className="ml-2 h-8 w-8">
              <div className="bg-gray-200 text-gray-600 flex items-center justify-center h-full w-full rounded-full font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Avatar>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start mb-4">
          <Avatar className="mr-2 h-8 w-8">
            <div className="bg-emerald-700 text-white flex items-center justify-center h-full w-full rounded-full">
              <Sparkles className="h-4 w-4" />
            </div>
          </Avatar>
          <div className="bg-muted text-foreground p-3 rounded-lg max-w-[75%] flex items-center">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </>
  );
}
