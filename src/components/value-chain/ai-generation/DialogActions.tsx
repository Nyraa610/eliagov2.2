
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";

interface DialogActionsProps {
  isGenerating: boolean;
  onCancel: () => void;
}

export function DialogActions({
  isGenerating,
  onCancel
}: DialogActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={onCancel} type="button" disabled={isGenerating}>
        Cancel
      </Button>
      <Button disabled={isGenerating} type="submit">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Value Chain
          </>
        )}
      </Button>
    </div>
  );
}
