
import { Progress } from "@/components/ui/progress";

interface GenerationProgressBarProps {
  isGenerating: boolean;
  progress: number;
}

export function GenerationProgressBar({ isGenerating, progress }: GenerationProgressBarProps) {
  if (!isGenerating) return null;
  
  return (
    <div className="mb-4 p-4 border rounded-lg bg-background">
      <h3 className="text-sm font-medium mb-2">Generating Value Chain</h3>
      <Progress value={progress} className="h-2 mb-2" />
      <p className="text-xs text-muted-foreground">
        {progress < 30 ? "Analyzing company information..." : 
         progress < 60 ? "Identifying key value chain components..." :
         progress < 90 ? "Creating value chain structure..." :
         "Finalizing your value chain..."}
      </p>
    </div>
  );
}
