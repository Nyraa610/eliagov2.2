
import { useState, useRef, useEffect } from 'react';
import { aiService, ChatHistoryItem } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from '@/hooks/useAuthState';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tag?: 'esg' | 'app' | 'general';
}

export const useEliaChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthState();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const determineMessageTag = (content: string): 'esg' | 'app' | 'general' => {
    const esgKeywords = ['esg', 'environment', 'social', 'governance', 'sustainability', 'carbon', 'emission', 'climate'];
    const appKeywords = ['app', 'platform', 'dashboard', 'report', 'feature', 'tool', 'profile', 'account'];
    
    const lowerContent = content.toLowerCase();
    
    if (esgKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'esg';
    }
    if (appKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'app';
    }
    return 'general';
  };

  const loadChatHistory = async () => {
    if (!user) {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
        timestamp: new Date(),
        tag: 'general'
      }]);
      return;
    }

    try {
      setIsLoading(true);
      const history = await aiService.getChatHistory();
      
      if (history && history.length > 0) {
        const formattedHistory: Message[] = history.flatMap((item) => [
          {
            role: 'user',
            content: item.user_message,
            timestamp: new Date(item.created_at),
            tag: item.tag || determineMessageTag(item.user_message)
          },
          {
            role: 'assistant',
            content: item.assistant_response,
            timestamp: new Date(item.created_at),
            tag: item.tag || determineMessageTag(item.user_message)
          }
        ]);
        
        setMessages(formattedHistory);
      } else {
        setMessages([{
          role: 'assistant',
          content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
          timestamp: new Date(),
          tag: 'general'
        }]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history. Starting a new conversation.",
        variant: "destructive",
      });
      
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
        timestamp: new Date(),
        tag: 'general'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      tag: determineMessageTag(input)
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const context = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const response = await aiService.getAssistantResponse(input, context);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        tag: userMessage.tag
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get response from assistant. Please try again.",
        variant: "destructive"
      });
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        tag: userMessage.tag
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((!hasLoadedHistory || user) && !isLoading) {
      loadChatHistory();
      setHasLoadedHistory(true);
    }
  }, [hasLoadedHistory, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    messagesEndRef,
    inputRef
  };
};

export type { Message };
