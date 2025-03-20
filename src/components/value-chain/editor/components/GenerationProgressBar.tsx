
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface GenerationProgressBarProps {
  isGenerating: boolean;
  progress: number;
}

export function GenerationProgressBar({ isGenerating, progress }: GenerationProgressBarProps) {
  if (!isGenerating) return null;
  
  return (
    <div className="mb-6 bg-muted p-4 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-medium">
          {progress < 100 ? "Generating your value chain..." : "Complete!"}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2">
        {progress < 100 
          ? "We're analyzing your company data and building an optimized value chain for ESG reporting." 
          : "Your value chain has been successfully generated!"}
      </p>
    </div>
  );
}
