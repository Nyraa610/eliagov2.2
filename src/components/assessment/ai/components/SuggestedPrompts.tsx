
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { SuggestedPromptGroups, MessageTag } from "../types/chat";

interface SuggestedPromptsProps {
  type: "esg" | "app";
  prompts: string[];
  onPromptClick: (prompt: string, tag: MessageTag) => void;
}

export function SuggestedPrompts({ type, prompts, onPromptClick }: SuggestedPromptsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg flex items-center gap-2">
        {type === "esg" ? (
          <img 
            src="/lovable-uploads/e5a0161f-aa8f-4767-a94c-4be0c0af9a56.png" 
            alt="Elia AI" 
            className="h-5 w-5 object-cover"
          />
        ) : (
          <HelpCircle className="h-5 w-5 text-blue-600" />
        )}
        {type === "esg" ? "ESG & Sustainability Questions" : "App Usage Help"}
      </h3>
      <p className="text-muted-foreground text-sm">
        {type === "esg" 
          ? "Get expert insights on environmental, social, and governance topics."
          : "Learn how to get the most out of the ELIA platform."}
      </p>
      <div className="grid gap-2">
        {prompts.map((prompt) => (
          <motion.div
            key={prompt}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 whitespace-normal text-left w-full"
              onClick={() => onPromptClick(prompt, type)}
            >
              {prompt}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
