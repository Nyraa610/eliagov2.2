
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MessagesSquare, SendHorizonal, Sparkles, ArrowDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

type Message = {
  content: string;
  role: "assistant" | "user";
  timestamp: Date;
};

export function EliaAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Elia, your ESG assessment assistant. I can help you understand sustainability concepts, guide you through the assessment process, or answer any questions about your sustainability journey. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to the chat
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Call Supabase Edge Function to get AI response
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'esg-assistant',
          content: inputMessage,
          context: messages.slice(-5) // Include last 5 messages for context
        }
      });
      
      if (error) throw error;
      
      // Add AI response to the chat
      const assistantMessage: Message = {
        role: "assistant",
        content: data.result || "I'm sorry, I couldn't process your request at this time.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting assistant response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from Elia. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <MessagesSquare className="h-5 w-5 text-primary" /> Chat with Elia
        </CardTitle>
        <CardDescription>
          Your ESG/RSE assessment assistant powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col h-full pb-0">
        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "assistant" ? "" : "flex-row-reverse"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary-foreground border border-primary/20">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-primary">
                      <div className="text-xs font-medium text-primary-foreground">You</div>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8 bg-primary-foreground border border-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="pt-4">
              <ArrowDown className="h-5 w-5 mx-auto text-muted-foreground animate-bounce" />
            </div>
          </div>
        </ScrollArea>
        <Separator className="my-2" />
        <div className="pt-2 pb-4 flex gap-2">
          <Input
            placeholder="Type your question about ESG/RSE assessments..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
