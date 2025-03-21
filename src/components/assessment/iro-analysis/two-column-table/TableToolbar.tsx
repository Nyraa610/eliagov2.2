
import { Button } from "@/components/ui/button";
import { PlusCircle, FilePlus } from "lucide-react";

interface TableToolbarProps {
  onAddItem: () => void;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}

export function TableToolbar({ 
  onAddItem, 
  onGenerateAI,
  isGenerating = false 
}: TableToolbarProps) {
  return (
    <div className="mb-4 flex justify-between">
      <div>
        {onGenerateAI && (
          <Button 
            onClick={onGenerateAI} 
            variant="secondary" 
            className="flex items-center gap-2 mr-2"
            disabled={isGenerating}
          >
            <FilePlus className="h-4 w-4" /> 
            {isGenerating ? "Generating..." : "Generate with AI"}
          </Button>
        )}
      </div>
      <Button 
        onClick={onAddItem} 
        variant="outline" 
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" /> Add Item
      </Button>
    </div>
  );
}
