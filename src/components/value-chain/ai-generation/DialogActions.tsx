
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Wand2 } from "lucide-react";

interface DialogActionsProps {
  isGenerating: boolean;
  isUploading?: boolean;
  hasFiles?: boolean;
  onCancel: () => void;
  isDisabled?: boolean;
}

export function DialogActions({
  isGenerating,
  isUploading = false,
  hasFiles = false,
  onCancel,
  isDisabled = false
}: DialogActionsProps) {
  const buttonDisabled = isGenerating || isUploading || isDisabled;
  
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={onCancel} type="button" disabled={buttonDisabled}>
        Cancel
      </Button>
      <Button disabled={buttonDisabled} type="submit">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading documents...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Value Chain
            {hasFiles && <Upload className="ml-2 h-3 w-3" />}
          </>
        )}
      </Button>
    </div>
  );
}
