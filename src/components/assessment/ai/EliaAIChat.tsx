
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, X, Maximize2, Minimize2, CornerDownLeft } from "lucide-react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useMobile } from "@/hooks/use-mobile";
import { ChatMessages } from './components/ChatMessages';
import { SuggestedPrompts } from './components/SuggestedPrompts';
import { useEliaChat } from '@/hooks/useEliaChat';

interface EliaAIChatProps {
  fullPage?: boolean;
}

export function EliaAIChat({ fullPage = false }: EliaAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const isMobile = useMobile();
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    messagesEndRef,
    inputRef
  } = useEliaChat();

  React.useEffect(() => {
    if (fullPage) {
      setIsOpen(true);
    }
  }, [fullPage]);

  React.useEffect(() => {
    if (isOpen && !isMobile) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (fullPage) {
    return (
      <div className="h-full flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <ChatMessages 
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />
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
    );
  }

  return (
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
              onClick={() => setIsOpen(true)} 
              size="lg" 
              className="rounded-full w-14 h-14 bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isOpen && !isMobile ? (
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
                  onClick={() => setIsExpanded(!isExpanded)}
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
                  onClick={() => setIsOpen(false)}
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
                <ScrollArea className="flex-1 p-4">
                  <ChatMessages 
                    messages={messages}
                    isLoading={isLoading}
                    messagesEndRef={messagesEndRef}
                  />
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
                  <SuggestedPrompts onPromptClick={handlePromptClick} />
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
      ) : null}

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
                  <ScrollArea className="flex-1 p-4">
                    <ChatMessages 
                      messages={messages}
                      isLoading={isLoading}
                      messagesEndRef={messagesEndRef}
                    />
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
                  <ScrollArea className="flex-1 p-4">
                    <SuggestedPrompts onPromptClick={handlePromptClick} />
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
    </div>
  );
}
