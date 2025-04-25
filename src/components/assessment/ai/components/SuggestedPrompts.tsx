
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tag, HelpCircle } from "lucide-react";

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void;
}

const suggestedPrompts = {
  esg: [
    "What are the key elements of an ESG strategy?",
    "How can I reduce my company's carbon footprint?",
    "What ESG reporting frameworks are recommended for small businesses?",
    "How do I conduct a materiality assessment?"
  ],
  app: [
    "How do I start an ESG assessment?",
    "Where can I find my stakeholder mapping results?",
    "How do I export my assessment reports?",
    "How do I invite team members to collaborate?"
  ]
};

export function SuggestedPrompts({ onPromptClick }: SuggestedPromptsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
          <Tag className="h-4 w-4 text-emerald-700" />
          ESG Questions
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {suggestedPrompts.esg.map((prompt, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm"
              className="justify-start text-xs h-auto py-2 px-3"
              onClick={() => onPromptClick(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
          <HelpCircle className="h-4 w-4 text-emerald-700" />
          Platform Help
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {suggestedPrompts.app.map((prompt, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm"
              className="justify-start text-xs h-auto py-2 px-3"
              onClick={() => onPromptClick(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="bg-emerald-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-emerald-800 mb-1">About Elia</h4>
        <p className="text-xs text-emerald-700">
          Elia is your ESG assistant, trained on sustainability best practices, ESG frameworks, and tools to help you with your sustainability journey.
        </p>
      </div>
    </div>
  );
}
