
import React from "react";
import { Motion, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Message } from "../types/chat";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const getTagBadgeColor = (tag?: 'esg' | 'app' | 'general') => {
    switch (tag) {
      case 'esg':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'app':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getTagLabel = (tag?: 'esg' | 'app' | 'general') => {
    switch (tag) {
      case 'esg':
        return 'ESG';
      case 'app':
        return 'App';
      default:
        return 'General';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-4 ${
        message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'
      }`}
    >
      <div className="flex items-start gap-2">
        {message.role === 'assistant' && (
          <Avatar className="h-8 w-8 bg-emerald-800">
            <img 
              src="/lovable-uploads/e5a0161f-aa8f-4767-a94c-4be0c0af9a56.png" 
              alt="Elia AI" 
              className="h-full w-full object-cover"
            />
          </Avatar>
        )}
        <div
          className={`rounded-lg p-3 relative ${
            message.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {message.tag && (
            <Badge 
              className={`absolute -top-2 -right-2 text-xs ${getTagBadgeColor(message.tag)}`}
              variant="secondary"
            >
              {getTagLabel(message.tag)}
            </Badge>
          )}
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className="mt-1 text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        {message.role === 'user' && (
          <Avatar className="h-8 w-8 bg-primary/20">
            <MessageSquare className="h-4 w-4 text-primary" />
          </Avatar>
        )}
      </div>
    </motion.div>
  );
}
