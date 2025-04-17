
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Award, ThumbsUp, Send, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { EliaAIChat } from "@/components/assessment/ai/EliaAIChat";

export function EliaAssistant() {
  const [expanded, setExpanded] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [motivationalMessages] = useState([
    "You're making great progress! Keep going!",
    "Remember, every step in your ESG journey matters!",
    "Ready to take your sustainability to the next level?",
    "Your commitment to sustainability is admirable!",
    "Small changes lead to big impact. You're doing great!",
    "Every assessment brings you closer to your ESG goals!",
    "You're on your way to becoming a sustainability leader!",
    "Keep up the great work - the planet thanks you!"
  ]);
  const { toast } = useToast();
  
  // Show chat and hide card when chat is opened
  const handleOpenChat = () => {
    setShowChat(true);
    setExpanded(false);
    setShowMessage(false);
    
    // Track engagement
    console.log("Elia AI Chat opened"); 
  };
  
  const handleExpand = () => {
    setExpanded(!expanded);
    setShowMessage(false);
    
    if (!expanded) {
      // Track engagement
      console.log("Elia assistant card opened"); 
    }
  };
  
  const handleLike = () => {
    setShowMessage(false);
    toast({
      title: "Thanks for the feedback!",
      description: "I'll keep providing helpful insights.",
      variant: "celebration",
    });
  };

  // Only show the preview card if chat is not open
  if (showChat) {
    // This is now handled by the global assistant through App.tsx
    return null;
  }

  return (
    <Card className="shadow-md border-emerald-800/20">
      <CardHeader className="pb-2 cursor-pointer bg-emerald-800 text-white" onClick={handleExpand}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-200 hover:text-white hover:bg-emerald-700">
              {expanded ? <X className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </motion.div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-2">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              I'm Elia, your ESG and sustainability assistant. How can I help you with your sustainability journey today?
            </p>
            
            <div className="space-y-2">
              <motion.div 
                className="p-2 rounded-md bg-emerald-800/10 hover:bg-emerald-800/20 cursor-pointer text-sm transition-colors flex items-center"
                whileHover={{ scale: 1.01 }}
                onClick={handleOpenChat}
              >
                <Award className="h-4 w-4 mr-2 text-emerald-800" />
                Get tips for improving my assessment
              </motion.div>
              
              <motion.div 
                className="p-2 rounded-md bg-emerald-800/10 hover:bg-emerald-800/20 cursor-pointer text-sm transition-colors flex items-center"
                whileHover={{ scale: 1.01 }}
                onClick={handleOpenChat}
              >
                <img 
                  src="/lovable-uploads/e5a0161f-aa8f-4767-a94c-4be0c0af9a56.png" 
                  alt="Elia AI" 
                  className="h-4 w-4 mr-2 object-cover" 
                />
                Help me understand ESG terminology
              </motion.div>

              <motion.div 
                className="p-2 rounded-md bg-emerald-800/10 hover:bg-emerald-800/20 cursor-pointer text-sm transition-colors flex items-center"
                whileHover={{ scale: 1.01 }}
                onClick={handleOpenChat}
              >
                <ThumbsUp className="h-4 w-4 mr-2 text-emerald-800" />
                Recommend next steps for my sustainability journey
              </motion.div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={handleOpenChat}
                className="w-full bg-emerald-800 hover:bg-emerald-700 text-white"
              >
                Start a conversation with Elia
              </Button>
            </motion.div>
          </div>
        </CardContent>
      )}
      
      <AnimatePresence>
        {showMessage && !expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pb-2">
              <div className="rounded-md bg-primary/5 p-3 text-sm relative">
                {message}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 absolute top-2 right-2"
                  onClick={() => setShowMessage(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-0 translate-y-1/2 left-4 w-2 h-2 bg-primary/5 rotate-45"></div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
