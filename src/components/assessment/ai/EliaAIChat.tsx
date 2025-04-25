import React, { useState, useRef, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  HelpCircle,
  CornerDownLeft,
  Sparkles,
  Tag
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiService } from "@/services/aiService";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useMobile } from "@/hooks/use-mobile";
import { useAuthState } from "@/hooks/useAuthState";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tag?: 'esg' | 'app' | 'general';
}

// Update the ChatHistoryItem type to include tag property
interface ChatHistoryItem {
  user_message: string;
  assistant_response: string;
  created_at: string;
  tag?: 'esg' | 'app' | 'general';
}

export function EliaAIChat({ fullPage = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const { user } = useAuthState();
  
  const suggestedPrompts = {
    esg: [
      "What are the key elements of an ESG strategy?",
      "How can I reduce my company's carbon footprint?",
      "What ESG reporting frameworks are recommended for small businesses?",
      "How do I conduct a materiality assessment?"
    ],
    app: [
      "How do I start an ESG assessment?",
      "Where can I find my stakeholder mapping results?",
      "How do I export my assessment reports?",
      "How do I invite team members to collaborate?"
    ]
  };

  // Auto-open chat on full page mode
  useEffect(() => {
    if (fullPage) {
      setIsOpen(true);
    }
  }, [fullPage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMobile) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMobile]);

  // Load chat history when component mounts or when user changes
  useEffect(() => {
    if ((!hasLoadedHistory || fullPage) && user) {
      loadChatHistory();
      setHasLoadedHistory(true);
    } else if (!hasLoadedHistory && !user) {
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
          timestamp: new Date(),
          tag: 'general'
        }
      ]);
      setHasLoadedHistory(true);
    }
  }, [hasLoadedHistory, user, fullPage]);

  // Determine the message tag based on content
  const determineMessageTag = (content: string): 'esg' | 'app' | 'general' => {
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
      
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
      }, 100);
    }
  };

  // ... rest of component functions and JSX remain unchanged
}
