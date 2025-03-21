
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AIGenerationDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onGenerate: (context: string) => Promise<void>;
  isGenerating: boolean;
}

export function AIGenerationDialog({
  isOpen,
  setIsOpen,
  onGenerate,
  isGenerating
}: AIGenerationDialogProps) {
  const [businessContext, setBusinessContext] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(businessContext);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Generate Risks & Opportunities with AI</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessContext">Business Context</Label>
            <Textarea
              id="businessContext"
              placeholder="Describe your company, industry, business model, key stakeholders, etc. to help the AI generate relevant risks and opportunities."
              value={businessContext}
              onChange={(e) => setBusinessContext(e.target.value)}
              className="min-h-[200px]"
              required
            />
            <p className="text-sm text-muted-foreground">
              The more detailed information you provide, the more accurate and relevant the AI-generated results will be.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating || !businessContext.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
