
import React from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const KeyTakeaways: React.FC = () => {
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className="font-medium flex items-center">
        <CheckCircle2 className="inline-block h-5 w-5 mr-2 text-green-500" />
        Key Takeaways
      </h3>
      <div className="bg-muted/50 p-4 rounded-md">
        <p className="text-sm">
          You've successfully completed this course and demonstrated your understanding of the core concepts.
          The knowledge you've gained will help you implement sustainable practices in your organization.
        </p>
      </div>
    </motion.div>
  );
};
