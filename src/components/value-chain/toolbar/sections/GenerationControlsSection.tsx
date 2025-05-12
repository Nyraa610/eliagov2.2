
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface GenerationControlsSectionProps {
  onAutomatedBuilder: () => void;
}

export function GenerationControlsSection({ 
  onAutomatedBuilder 
}: GenerationControlsSectionProps) {
  return (
    <div className="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="secondary" onClick={onAutomatedBuilder} className="gap-1">
              <Wand2 className="h-4 w-4" />
              Auto Builder
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate value chain with AI</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
