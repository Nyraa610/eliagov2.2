
import React from "react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
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
          src="/lovable-uploads/e5a0161f-aa8f-4767-a94c-4be0c0af9a56.png" 
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
  );
}
