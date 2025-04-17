
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
  Sparkles
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
      // Set a welcome message for non-authenticated users
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
          timestamp: new Date()
        }
      ]);
      setHasLoadedHistory(true);
    }
  }, [hasLoadedHistory, user, fullPage]);

  const loadChatHistory = async () => {
    if (!user) {
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
          timestamp: new Date()
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
        
        // Process the history in pairs to maintain conversation flow
        for (let i = 0; i < history.length; i++) {
          const item = history[i];
          formattedHistory.push({
            role: 'user',
            content: item.user_message,
            timestamp: new Date(item.created_at)
          });
          
          formattedHistory.push({
            role: 'assistant',
            content: item.assistant_response,
            timestamp: new Date(item.created_at)
          });
        }
        
        setMessages(formattedHistory);
      } else {
        console.log("No chat history found, setting welcome message");
        setMessages([
          {
            role: 'assistant',
            content: "Hello! I'm Elia, your ESG and sustainability assistant. How can I help you today?",
            timestamp: new Date()
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
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      
      // Ensure scroll to bottom after history is loaded
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
      }, 100);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
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
        context: messageContext
      });
      
      console.log("AI response received:", response);
      
      if (response && response.result && typeof response.result === 'string') {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.result,
          timestamp: new Date()
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
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      
      // Ensure scroll to bottom after sending message
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setActiveTab("chat");
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    
    // If opening the chat and history hasn't been loaded yet, load it
    if (!isOpen && !hasLoadedHistory && user) {
      loadChatHistory();
      setHasLoadedHistory(true);
    }
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderMessages = () => {
    return messages.map((message, index) => (
      <motion.div
        key={index}
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
                src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                alt="Elia AI" 
                className="h-full w-full object-cover"
              />
            </Avatar>
          )}
          <div
            className={`rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
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
    ));
  };

  // Render full page version for the /expert/talk route
  if (fullPage) {
    return (
      <Card className="h-full flex flex-col overflow-hidden border-emerald-800/20">
        <CardHeader className="p-3 border-b bg-emerald-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-emerald-900 border border-amber-400/50">
                <img 
                  src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                  alt="Elia AI" 
                  className="h-full w-full object-cover"
                />
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">Elia Assistant</h3>
                <p className="text-xs text-amber-200">ESG & Business Expert</p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none px-2">
            <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Chat
            </TabsTrigger>
            <TabsTrigger value="esg" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              ESG Help
            </TabsTrigger>
            <TabsTrigger value="app" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              App Help
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col p-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4" id="chat-scroll-area">
              <div className="pb-2">
                {renderMessages()}
                <div ref={messagesEndRef} />
                
                {isLoading && (
                  <motion.div 
                    className="flex items-center gap-2 mt-2"
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [0.98, 1.02, 0.98],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2 
                    }}
                  >
                    <Avatar className="h-8 w-8 bg-emerald-800">
                      <img 
                        src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                        alt="Elia AI" 
                        className="h-full w-full object-cover"
                      />
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex space-x-2">
                        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                        <div className="flex space-x-1">
                          <motion.div 
                            className="h-2 w-2 rounded-full bg-emerald-500" 
                            animate={{ scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div 
                            className="h-2 w-2 rounded-full bg-emerald-500" 
                            animate={{ scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                          />
                          <motion.div 
                            className="h-2 w-2 rounded-full bg-emerald-500" 
                            animate={{ scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="esg" className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <img 
                  src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                  alt="Elia AI" 
                  className="h-5 w-5 object-cover"
                />
                ESG & Sustainability Questions
              </h3>
              <p className="text-muted-foreground text-sm">
                Get expert insights on environmental, social, and governance topics.
              </p>
              <div className="grid gap-2">
                {suggestedPrompts.esg.map((prompt) => (
                  <motion.div
                    key={prompt}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="justify-start h-auto py-3 px-4 whitespace-normal text-left w-full"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      {prompt}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="app" className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                App Usage Help
              </h3>
              <p className="text-muted-foreground text-sm">
                Learn how to get the most out of the ELIA platform.
              </p>
              <div className="grid gap-2">
                {suggestedPrompts.app.map((prompt) => (
                  <motion.div
                    key={prompt}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="justify-start h-auto py-3 px-4 whitespace-normal text-left w-full"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      {prompt}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="p-3 border-t">
          <div className="flex gap-2 w-full">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about ESG or how to use the app..."
              disabled={isLoading}
              className="flex-1"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-emerald-800 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <>
        <Drawer>
          <DrawerTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg"
                size="icon"
                onClick={handleToggle}
              >
                <Avatar className="h-14 w-14 bg-emerald-800 border-2 border-amber-400">
                  <img 
                    src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                    alt="Elia AI" 
                    className="h-full w-full object-cover" 
                  />
                </Avatar>
              </Button>
            </motion.div>
          </DrawerTrigger>
          <DrawerContent className="h-[85vh]">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 bg-emerald-800">
                      <img 
                        src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                        alt="Elia AI" 
                        className="h-full w-full object-cover"
                      />
                    </Avatar>
                    <h3 className="font-semibold">Elia Assistant</h3>
                  </div>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start border-b rounded-none px-4">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="esg" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    ESG Help
                  </TabsTrigger>
                  <TabsTrigger value="app" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    App Help
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="flex-1 flex flex-col space-y-4 p-4 h-0 overflow-hidden">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="pb-2">
                      {renderMessages()}
                      <div ref={messagesEndRef} />
                      
                      {isLoading && (
                        <motion.div 
                          className="flex items-center gap-2 mt-2"
                          animate={{ 
                            opacity: [0.5, 1, 0.5],
                            scale: [0.98, 1.02, 0.98],
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2 
                          }}
                        >
                          <Avatar className="h-8 w-8 bg-emerald-800">
                            <img 
                              src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                              alt="Elia AI" 
                              className="h-full w-full object-cover"
                            />
                          </Avatar>
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex space-x-2">
                              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                              <div className="flex space-x-1">
                                <motion.div 
                                  className="h-2 w-2 rounded-full bg-emerald-500" 
                                  animate={{ scale: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                />
                                <motion.div 
                                  className="h-2 w-2 rounded-full bg-emerald-500" 
                                  animate={{ scale: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                                />
                                <motion.div 
                                  className="h-2 w-2 rounded-full bg-emerald-500" 
                                  animate={{ scale: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about ESG or how to use the app..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          size="icon"
                          className="bg-emerald-800 hover:bg-emerald-700"
                        >
                          {isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <CornerDownLeft className="h-4 w-4" />
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="esg" className="flex-1 p-4 h-0 overflow-auto">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <img 
                        src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                        alt="Elia AI" 
                        className="h-5 w-5 object-cover"
                      />
                      ESG & Sustainability Questions
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Get expert insights on environmental, social, and governance topics.
                    </p>
                    <div className="grid gap-2">
                      {suggestedPrompts.esg.map((prompt) => (
                        <motion.div
                          key={prompt}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            className="justify-start h-auto py-3 px-4 whitespace-normal text-left w-full"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            {prompt}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="app" className="flex-1 p-4 h-0 overflow-auto">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                      App Usage Help
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Learn how to get the most out of the ELIA platform.
                    </p>
                    <div className="grid gap-2">
                      {suggestedPrompts.app.map((prompt) => (
                        <motion.div
                          key={prompt}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            className="justify-start h-auto py-3 px-4 whitespace-normal text-left w-full"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            {prompt}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop view
  return (
    <>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
        >
          <Button
            className="h-14 w-14 rounded-full shadow-lg"
            size="icon"
            onClick={handleToggle}
          >
            <Avatar className="h-14 w-14 bg-emerald-800 border-2 border-amber-400">
              <img 
                src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                alt="Elia AI" 
                className="h-full w-full object-cover" 
              />
            </Avatar>
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring" }}
            className={`fixed top-1/2 -translate-y-1/2 right-4 z-50 shadow-xl ${
              isExpanded ? 'w-[800px] h-[80vh]' : 'w-[380px] h-[500px]'
            }`}
          >
            <Card className="h-full flex flex-col overflow-hidden border-emerald-800/20">
              <CardHeader className="p-3 border-b bg-emerald-800 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 bg-emerald-900 border border-amber-400/50">
                      <img 
                        src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                        alt="Elia AI" 
                        className="h-full w-full object-cover"
                      />
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">Elia Assistant</h3>
                      <p className="text-xs text-amber-200">ESG & Business Expert</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-amber-200 hover:text-white hover:bg-emerald-700"
                        onClick={handleExpand}
                      >
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-amber-200 hover:text-white hover:bg-emerald-700"
                        onClick={handleToggle}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start border-b rounded-none px-2">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="esg" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    ESG Help
                  </TabsTrigger>
                  <TabsTrigger value="app" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    App Help
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="flex-1 flex flex-col p-4 overflow-hidden">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="pb-2">
                      {renderMessages()}
                      <div ref={messagesEndRef} />
                      
                      {isLoading && (
                        <motion.div 
                          className="flex items-center gap-2 mt-2"
                          animate={{ 
                            opacity: [0.5, 1, 0.5],
                            scale: [0.98, 1.02, 0.98],
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2 
                          }}
                        >
                          <Avatar className="h-8 w-8 bg-emerald-800">
                            <img 
                              src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                              alt="Elia AI" 
                              className="h-full w-full object-cover"
                            />
                          </Avatar>
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex space-x-2">
                              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                              <div className="flex space-x-1">
                                <motion.div 
                                  className="h-2 w-2 rounded-full bg-emerald-500" 
                                  animate={{ scale: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                />
                                <motion.div 
                                  className="h-2 w-2 rounded-full bg-emerald-500" 
                                  animate={{ scale: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                                />
                                <motion.div 
                                  className="h-2 w-2 rounded-full bg-emerald-500" 
                                  animate={{ scale: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="esg" className="flex-1 p-4 overflow-auto">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <img 
                        src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
                        alt="Elia AI" 
                        className="h-5 w-5 object-cover"
                      />
                      ESG & Sustainability Questions
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Get expert insights on environmental, social, and governance topics.
                    </p>
                    <div className="grid gap-2">
                      {suggestedPrompts.esg.map((prompt) => (
                        <motion.div
                          key={prompt}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            className="justify-start h-auto py-3 px-4 whitespace-normal text-left w-full"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            {prompt}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="app" className="flex-1 p-4 overflow-auto">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                      App Usage Help
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Learn how to get the most out of the ELIA platform.
                    </p>
                    <div className="grid gap-2">
                      {suggestedPrompts.app.map((prompt) => (
                        <motion.div
                          key={prompt}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            className="justify-start h-auto py-3 px-4 whitespace-normal text-left w-full"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            {prompt}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <CardFooter className="p-3 border-t">
                <div className="flex gap-2 w-full">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about ESG or how to use the app..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="bg-emerald-800 hover:bg-emerald-700"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
