
import React, { useState } from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger 
} from "@/components/ui/drawer";
import { 
  Tabs, 
  TabsList, 
  TabsContent, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "../components/ChatMessages";
import { ChatInput } from "../components/ChatInput";
import { SuggestedPrompts } from "../components/SuggestedPrompts";
import { CornerDownLeft } from "lucide-react";
import { SuggestedPromptGroups, Message } from "../types/chat";
import { motion } from "framer-motion";

interface MobileChatLayoutProps {
  messages: Message[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handlePromptClick: (prompt: string, tag: 'esg' | 'app') => void;
  suggestedPrompts: SuggestedPromptGroups;
  handleToggle: () => void;
}

export function MobileChatLayout({
  messages,
  isLoading,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  handlePromptClick,
  suggestedPrompts,
  handleToggle
}: MobileChatLayoutProps) {
  const [activeTab, setActiveTab] = useState("chat");

  return (
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
                src="/lovable-uploads/e5a0161f-aa8f-4767-a94c-4be0c0af9a56.png" 
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
                    src="/lovable-uploads/e5a0161f-aa8f-4767-a94c-4be0c0af9a56.png" 
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
              <ChatMessages messages={messages} isLoading={isLoading} />
              
              <div className="pt-4 border-t">
                <ChatInput 
                  input={input}
                  setInput={setInput}
                  onSend={handleSend}
                  isLoading={isLoading}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="esg" className="flex-1 p-4 h-0 overflow-auto">
              <SuggestedPrompts 
                type="esg" 
                prompts={suggestedPrompts.esg} 
                onPromptClick={handlePromptClick} 
              />
            </TabsContent>
            
            <TabsContent value="app" className="flex-1 p-4 h-0 overflow-auto">
              <SuggestedPrompts 
                type="app" 
                prompts={suggestedPrompts.app} 
                onPromptClick={handlePromptClick} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
