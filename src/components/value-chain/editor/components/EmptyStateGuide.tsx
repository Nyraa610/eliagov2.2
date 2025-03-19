
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Upload } from "lucide-react";

interface EmptyStateGuideProps {
  onOpenAIDialog: () => void;
  onOpenAutomatedBuilder: () => void;
  onOpenUploadDialog: () => void;
}

export function EmptyStateGuide({
  onOpenAIDialog,
  onOpenAutomatedBuilder,
  onOpenUploadDialog
}: EmptyStateGuideProps) {
  return (
    <div className="bg-muted p-6 mb-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Value Chain Modeling in Elia Go</h3>
      <p className="mb-4 text-muted-foreground">
        This tool helps you visualize and analyze your company's value chain - the sequence of activities that create value for customers.
        Value chains are essential for ESG reporting as they help identify environmental and social impacts across your business operations.
      </p>
      <ul className="list-disc pl-5 space-y-2 mb-4 text-muted-foreground">
        <li>Use the toolbar to add different types of nodes: primary activities (core operations), support activities, and external factors</li>
        <li>Connect nodes by dragging from one node's handle to another</li>
        <li>Click on any node to edit its properties</li>
        <li>Use the AI generation feature to automatically create a value chain based on your company information</li>
        <li>Upload supporting documents to help with AI-assisted value chain creation</li>
      </ul>
      <div className="flex gap-2 mt-4">
        <Button onClick={onOpenAIDialog} className="gap-1">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
        <Button onClick={onOpenAutomatedBuilder} variant="outline" className="gap-1">
          <Wand2 className="h-4 w-4" />
          Automated Builder
        </Button>
        <Button onClick={onOpenUploadDialog} variant="outline" className="gap-1">
          <Upload className="h-4 w-4" />
          Upload Documents
        </Button>
      </div>
    </div>
  );
}
