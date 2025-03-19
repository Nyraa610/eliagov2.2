
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FileText, Wand2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GenerationControlsProps {
  onGenerateAI: () => void;
  onUploadDocuments: () => void;
  onAutomatedBuilder: () => void;
}

export function GenerationControls({ 
  onGenerateAI, 
  onUploadDocuments, 
  onAutomatedBuilder 
}: GenerationControlsProps) {
  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="secondary" onClick={onGenerateAI} className="gap-1">
            <ArrowUpRight className="h-4 w-4" />
            Generate with AI
          </Button>
        </TooltipTrigger>
        <TooltipContent>Generate value chain with AI</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="outline" onClick={onUploadDocuments} className="gap-1">
            <FileText className="h-4 w-4" />
            Upload Documents
          </Button>
        </TooltipTrigger>
        <TooltipContent>Upload supporting documents</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="outline" onClick={onAutomatedBuilder} className="gap-1">
            <Wand2 className="h-4 w-4" />
            Auto Builder
          </Button>
        </TooltipTrigger>
        <TooltipContent>Start automated value chain builder</TooltipContent>
      </Tooltip>
    </div>
  );
}
