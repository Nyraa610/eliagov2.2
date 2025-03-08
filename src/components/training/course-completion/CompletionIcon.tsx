
import React from "react";
import { Trophy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface CompletionIconProps {
  isSuccessful: boolean;
}

export const CompletionIcon: React.FC<CompletionIconProps> = ({ isSuccessful }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2 
      }}
    >
      {isSuccessful ? (
        <Trophy className="h-24 w-24 text-primary" />
      ) : (
        <CheckCircle2 className="h-24 w-24 text-primary" />
      )}
    </motion.div>
  );
};
