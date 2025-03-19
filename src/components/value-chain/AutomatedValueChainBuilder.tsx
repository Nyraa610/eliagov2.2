
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2 } from "lucide-react";

interface AutomatedValueChainBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => Promise<void>;
  companyName: string;
  industry: string;
  location: string;
}

export function AutomatedValueChainBuilder({
  open,
  onOpenChange,
  onGenerate,
  companyName,
  industry,
  location
}: AutomatedValueChainBuilderProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await onGenerate(prompt);
      onOpenChange(false);
      setPrompt("");
    } catch (error) {
      console.error("Error generating value chain:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Automated Value Chain Builder</DialogTitle>
          <DialogDescription>
            Our AI will build a value chain optimized for ESG reporting based on your company profile and additional context.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-2">Company Profile</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Company:</span> {companyName || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Industry:</span> {industry || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {location || "Not specified"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context</Label>
            <Textarea
              id="context"
              placeholder="Add specific information about your value chain, business model, or particular ESG focus areas..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              The more details you provide, the more accurate your value chain will be.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
