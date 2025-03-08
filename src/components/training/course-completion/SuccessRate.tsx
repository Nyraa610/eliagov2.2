
import React from "react";
import { motion } from "framer-motion";

interface SuccessRateProps {
  earnedPoints: number;
  totalPoints: number;
  successRate: number;
}

export const SuccessRate: React.FC<SuccessRateProps> = ({ 
  earnedPoints, 
  totalPoints, 
  successRate 
}) => {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="text-3xl font-bold">
        {successRate}%
      </div>
      <p className="text-muted-foreground">
        You earned {earnedPoints} out of {totalPoints} points
      </p>
    </motion.div>
  );
};
