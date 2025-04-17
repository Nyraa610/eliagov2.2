
import React, { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardFooter,
  CardContent 
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { 
  Tabs, 
  TabsList, 
  TabsContent, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ChatMessages } from "../components/ChatMessages";
import { ChatInput } from "../components/ChatInput";
import { SuggestedPrompts } from "../components/SuggestedPrompts";
import { SuggestedPromptGroups, Message } from "../types/chat";

interface FullPageLayoutProps {
  messages: Message[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handlePromptClick: (prompt: string, tag: 'esg' | 'app') => void;
  suggestedPrompts: SuggestedPromptGroups;
}

export function FullPageLayout({
  messages,
  isLoading,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  handlePromptClick,
  suggestedPrompts
}: FullPageLayoutProps) {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <Card className="h-full flex flex-col overflow-hidden border-emerald-800/20">
      <CardHeader className="p-3 border-b bg-emerald-800 text-white shrink-0">
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
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start border-b rounded-none px-2 shrink-0">
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
      
      <CardFooter className="p-3 border-t shrink-0">
        <ChatInput 
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          onKeyDown={handleKeyDown}
        />
      </CardFooter>
    </Card>
  );
}
