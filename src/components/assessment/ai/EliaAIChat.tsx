
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

  // Add the missing handleSendMessage function and other required functions
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
      // Get previous messages for context
      const context = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call AI service
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
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };
  
  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  // Render the chat interface
  return (
    <>
      {!fullPage && (
        <div className="fixed bottom-4 right-4 z-50">
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
              >
                <Button 
                  onClick={toggleChat} 
                  size="lg" 
                  className="rounded-full w-14 h-14 bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg"
                >
                  <MessageSquare className="h-6 w-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {isOpen && !isMobile && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="fixed bottom-4 right-4"
                style={{
                  width: isExpanded ? '600px' : '380px',
                  height: isExpanded ? '80vh' : '500px',
                }}
              >
                <Card className="shadow-xl border-emerald-800/20 h-full flex flex-col">
                  <CardHeader className="p-3 border-b flex flex-row justify-between items-center bg-emerald-800 text-white">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <h3 className="font-medium">Chat with Elia</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleExpand}
                        className="text-white hover:bg-emerald-700"
                      >
                        {isExpanded ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={toggleChat}
                        className="text-white hover:bg-emerald-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-2 m-2">
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                      <TabsTrigger value="help">Help</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
                      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                      </ScrollArea>
                      
                      <CardFooter className="border-t p-2">
                        <div className="relative w-full flex items-center">
                          <Input
                            placeholder="Ask a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="pr-10"
                            ref={inputRef}
                          />
                          <Button
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            onClick={handleSendMessage}
                            className="absolute right-0 top-0 bottom-0 rounded-l-none bg-emerald-700 hover:bg-emerald-800"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </TabsContent>
                    
                    <TabsContent value="help" className="p-0 m-0 flex-1 flex flex-col">
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                              <Tag className="h-4 w-4 text-emerald-700" />
                              ESG Questions
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {suggestedPrompts.esg.map((prompt, index) => (
                                <Button 
                                  key={index} 
                                  variant="outline" 
                                  size="sm"
                                  className="justify-start text-xs h-auto py-2 px-3"
                                  onClick={() => handlePromptClick(prompt)}
                                >
                                  {prompt}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                              <HelpCircle className="h-4 w-4 text-emerald-700" />
                              Platform Help
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {suggestedPrompts.app.map((prompt, index) => (
                                <Button 
                                  key={index} 
                                  variant="outline" 
                                  size="sm"
                                  className="justify-start text-xs h-auto py-2 px-3"
                                  onClick={() => handlePromptClick(prompt)}
                                >
                                  {prompt}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-emerald-50 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-emerald-800 mb-1">About Elia</h4>
                            <p className="text-xs text-emerald-700">
                              Elia is your ESG assistant, trained on sustainability best practices, ESG frameworks, and tools to help you with your sustainability journey.
                            </p>
                          </div>
                        </div>
                      </ScrollArea>
                      
                      <CardFooter className="border-t p-2 justify-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveTab("chat")}
                          className="flex gap-1 items-center"
                        >
                          <CornerDownLeft className="h-4 w-4" />
                          Return to chat
                        </Button>
                      </CardFooter>
                    </TabsContent>
                  </Tabs>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {isOpen && isMobile && !fullPage && (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="max-h-[85vh]">
            <div className="p-3 border-b flex flex-row justify-between items-center bg-emerald-800 text-white">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-medium">Chat with Elia</h3>
              </div>
            </div>
            
            <div className="flex flex-col h-[70vh]">
              <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-2 m-2">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
                  <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    {/* Same message rendering code as above */}
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
                  </ScrollArea>
                  
                  <div className="border-t p-3">
                    <div className="relative w-full flex items-center">
                      <Input
                        placeholder="Ask a question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="pr-10"
                        ref={inputRef}
                      />
                      <Button
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        onClick={handleSendMessage}
                        className="absolute right-0 top-0 bottom-0 rounded-l-none bg-emerald-700 hover:bg-emerald-800"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="help" className="p-0 m-0 flex-1 flex flex-col">
                  {/* Same help content as above */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                          <Tag className="h-4 w-4 text-emerald-700" />
                          ESG Questions
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {suggestedPrompts.esg.map((prompt, index) => (
                            <Button 
                              key={index} 
                              variant="outline" 
                              size="sm"
                              className="justify-start text-xs h-auto py-2 px-3"
                              onClick={() => handlePromptClick(prompt)}
                            >
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                          <HelpCircle className="h-4 w-4 text-emerald-700" />
                          Platform Help
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {suggestedPrompts.app.map((prompt, index) => (
                            <Button 
                              key={index} 
                              variant="outline" 
                              size="sm"
                              className="justify-start text-xs h-auto py-2 px-3"
                              onClick={() => handlePromptClick(prompt)}
                            >
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-emerald-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-emerald-800 mb-1">About Elia</h4>
                        <p className="text-xs text-emerald-700">
                          Elia is your ESG assistant, trained on sustainability best practices, ESG frameworks, and tools to help you with your sustainability journey.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <div className="border-t p-3 flex justify-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab("chat")}
                      className="flex gap-1 items-center"
                    >
                      <CornerDownLeft className="h-4 w-4" />
                      Return to chat
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {fullPage && (
        <div className="h-full flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
          </ScrollArea>
          
          <div className="border-t p-3">
            <div className="relative w-full flex items-center">
              <Input
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="pr-10"
                ref={inputRef}
              />
              <Button
                size="icon"
                disabled={isLoading || !input.trim()}
                onClick={handleSendMessage}
                className="absolute right-0 top-0 bottom-0 rounded-l-none bg-emerald-700 hover:bg-emerald-800"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
