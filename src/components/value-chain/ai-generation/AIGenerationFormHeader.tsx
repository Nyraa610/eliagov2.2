
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

export function AIGenerationFormHeader() {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Generate Value Chain with AI
      </DialogTitle>
      <DialogDescription>
        Provide information about your company to generate a value chain model
      </DialogDescription>
    </DialogHeader>
  );
}
