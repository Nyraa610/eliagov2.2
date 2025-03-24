
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, Award, ThumbsUp, Send, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export function EliaAssistant() {
  const [expanded, setExpanded] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
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
  
  useEffect(() => {
    // Show a random motivational message after 10 seconds
    const timer = setTimeout(() => {
      if (!expanded) {
        setMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
        setShowMessage(true);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [expanded, motivationalMessages]);
  
  const handleExpand = () => {
    setExpanded(!expanded);
    setShowMessage(false);
    
    if (!expanded) {
      // Track engagement
      console.log("Elia assistant opened"); 
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

  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader className="pb-2 cursor-pointer" onClick={handleExpand}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </Avatar>
            <h3 className="font-semibold text-primary">Elia Assistant</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {expanded ? <X className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-2">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              I'm Elia, your sustainability assistant. How can I help you with your ESG assessment today?
            </p>
            
            <div className="space-y-2">
              <motion.div 
                className="p-2 rounded-md bg-primary/10 hover:bg-primary/20 cursor-pointer text-sm transition-colors flex items-center"
                whileHover={{ scale: 1.01 }}
              >
                <Award className="h-4 w-4 mr-2 text-primary" />
                Get tips for improving my assessment
              </motion.div>
              
              <motion.div 
                className="p-2 rounded-md bg-primary/10 hover:bg-primary/20 cursor-pointer text-sm transition-colors flex items-center"
                whileHover={{ scale: 1.01 }}
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Help me understand ESG terminology
              </motion.div>

              <motion.div 
                className="p-2 rounded-md bg-primary/10 hover:bg-primary/20 cursor-pointer text-sm transition-colors flex items-center"
                whileHover={{ scale: 1.01 }}
              >
                <ThumbsUp className="h-4 w-4 mr-2 text-primary" />
                Recommend next steps for my sustainability journey
              </motion.div>
            </div>
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
            <CardFooter className="pt-0 flex justify-end space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={handleLike}
              >
                <ThumbsUp className="h-3 w-3 mr-1" /> Helpful
              </Button>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
