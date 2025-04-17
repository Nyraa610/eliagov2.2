
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsContent, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { ChatMessages } from "../components/ChatMessages";
import { ChatInput } from "../components/ChatInput";
import { SuggestedPrompts } from "../components/SuggestedPrompts";
import { SuggestedPromptGroups, Message } from "../types/chat";

interface FloatingChatLayoutProps {
  isOpen: boolean;
  isExpanded: boolean;
  messages: Message[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleToggle: () => void;
  handleExpand: () => void;
  handlePromptClick: (prompt: string, tag: 'esg' | 'app') => void;
  suggestedPrompts: SuggestedPromptGroups;
}

export function FloatingChatLayout({
  isOpen,
  isExpanded,
  messages,
  isLoading,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  handleToggle,
  handleExpand,
  handlePromptClick,
  suggestedPrompts
}: FloatingChatLayoutProps) {
  const [activeTab, setActiveTab] = useState("chat");

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
                src="/lovable-uploads/e5a0161f-aa8f-4767-a94c-4be0c0af9a56.png" 
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
                        src="/lovable-uploads/e5a0161f-aa8f-4767-a94c-4be0c0af9a56.png" 
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
                        className="text-white hover:bg-emerald-700"
                        onClick={handleExpand}
                      >
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-emerald-700"
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
                
                <TabsContent value="chat" className="flex-1 flex flex-col p-4 m-0 overflow-hidden">
                  <ChatMessages messages={messages} isLoading={isLoading} />
                </TabsContent>
                
                <TabsContent value="esg" className="flex-1 p-4 overflow-auto m-0">
                  <SuggestedPrompts 
                    type="esg" 
                    prompts={suggestedPrompts.esg} 
                    onPromptClick={handlePromptClick} 
                  />
                </TabsContent>
                
                <TabsContent value="app" className="flex-1 p-4 overflow-auto m-0">
                  <SuggestedPrompts 
                    type="app" 
                    prompts={suggestedPrompts.app} 
                    onPromptClick={handlePromptClick} 
                  />
                </TabsContent>
              </Tabs>
              
              <CardFooter className="p-3 border-t">
                <ChatInput 
                  input={input}
                  setInput={setInput}
                  onSend={handleSend}
                  isLoading={isLoading}
                  onKeyDown={handleKeyDown}
                />
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
