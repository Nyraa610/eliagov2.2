
import { useState, useRef, useEffect } from "react";
import { Message, ChatHistoryItem, MessageTag } from "../types/chat";
import { aiService } from "@/services/aiService";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "@/hooks/useAuthState";

export function useChatState() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthState();
  
  const determineMessageTag = (content: string): MessageTag => {
    const esgKeywords = ['esg', 'environment', 'social', 'governance', 'sustainability', 'carbon', 'emission', 'climate', 
                         'biodiversity', 'waste', 'energy', 'diversity', 'inclusion', 'human rights', 'compliance'];
    
    const appKeywords = ['app', 'platform', 'dashboard', 'report', 'feature', 'tool', 'profile', 'account', 'login', 
                         'assessment', 'form', 'export', 'import', 'upload', 'download', 'settings'];
    
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
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
          timestamp: new Date(),
          tag: 'general'
        }
      ]);
      return;
    }

    try {
      console.log("Loading chat history from database...");
      setIsLoading(true);
      const history = await aiService.getChatHistory();
      
      if (history && history.length > 0) {
        console.log(`Loaded ${history.length} chat history entries`);
        const formattedHistory: Message[] = [];
        
        for (let i = 0; i < history.length; i++) {
          const item = history[i];
          const userMessage = {
            role: 'user' as const,
            content: item.user_message,
            timestamp: new Date(item.created_at),
            tag: item.tag || determineMessageTag(item.user_message)
          };
          
          formattedHistory.push(userMessage);
          
          formattedHistory.push({
            role: 'assistant' as const,
            content: item.assistant_response,
            timestamp: new Date(item.created_at),
            tag: userMessage.tag
          });
        }
        
        setMessages(formattedHistory);
      } else {
        console.log("No chat history found, setting welcome message");
        setMessages([
          {
            role: 'assistant',
            content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
            timestamp: new Date(),
            tag: 'general'
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history. Starting a new conversation.",
        variant: "destructive",
      });
      
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
          timestamp: new Date(),
          tag: 'general'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (input: string, activeTab: string) => {
    if (!input.trim() || isLoading) return;
    
    const messageTag = activeTab === 'esg' ? 'esg' : 
                        activeTab === 'app' ? 'app' : 
                        determineMessageTag(input);
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      tag: messageTag
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const messageContext = messages
        .slice(-6)
        .map(msg => ({ role: msg.role, content: msg.content }));
      
      console.log("Sending AI request with context", messageContext.length);
      
      const response = await aiService.analyzeContent({
        type: 'esg-assistant',
        content: input,
        context: messageContext,
        additionalParams: {
          tag: messageTag
        }
      });
      
      console.log("AI response received:", response);
      
      if (response && response.result && typeof response.result === 'string') {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.result,
          timestamp: new Date(),
          tag: messageTag
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        console.log("Added assistant message to chat");
      } else {
        console.error("Empty or invalid response from AI service:", response);
        throw new Error("Invalid response from AI service");
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your request. Please try asking again.",
          timestamp: new Date(),
          tag: messageTag as MessageTag
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    hasLoadedHistory,
    setHasLoadedHistory,
    loadChatHistory,
    handleSend,
    determineMessageTag
  };
}
