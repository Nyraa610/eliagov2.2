
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Wand2, FileText } from "lucide-react";

interface AIQuickGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  progress: number;
  hasDocuments?: boolean;
}

export function AIQuickGenerateDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  progress,
  hasDocuments = false
}: AIQuickGenerateDialogProps) {
  const [prompt, setPrompt] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    await onGenerate(prompt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate Value Chain with AI
          </DialogTitle>
          <DialogDescription>
            Quickly create a comprehensive value chain model for ESG reporting with AI assistance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="prompt">Company Description or Instructions</Label>
            <Textarea
              id="prompt"
              placeholder="Describe your company and its operations, or provide specific instructions for the value chain model..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              For best results, include your industry, main products/services, and key business activities.
            </p>
          </div>

          {hasDocuments && (
            <div className="rounded-md bg-muted p-3">
              <div className="flex items-center text-sm">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                <span>Your uploaded documents will be analyzed to enhance the generated value chain.</span>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Generating your value chain...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Now
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
