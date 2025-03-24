
import { Button } from "@/components/ui/button";
import { PlusCircle, FilePlus } from "lucide-react";

interface EmptyStateProps {
  onAddItem: () => void;
  onGenerateWithAI: () => void;
}

export function EmptyState({ onAddItem, onGenerateWithAI }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border rounded-md bg-muted/20">
      <div className="max-w-md text-center space-y-4">
        <h3 className="text-lg font-semibold">No Risks or Opportunities Added</h3>
        <p className="text-muted-foreground">
          Start by adding risks and opportunities manually, or let AI generate them for you based on your business context.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <Button
            onClick={onGenerateWithAI}
            variant="default"
            className="flex items-center gap-2"
          >
            <FilePlus className="h-4 w-4" /> Generate with AI
          </Button>
          <Button
            onClick={onAddItem}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" /> Add Manually
          </Button>
        </div>
      </div>
    </div>
  );
}
