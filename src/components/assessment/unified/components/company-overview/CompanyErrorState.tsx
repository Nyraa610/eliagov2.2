
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface CompanyErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function CompanyErrorState({ error, onRetry }: CompanyErrorStateProps) {
  return (
    <div className="bg-destructive/10 p-4 rounded-lg text-destructive">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="font-medium">Analysis Error</h3>
      </div>
      <p className="text-sm mb-3">{error}</p>
      <div className="text-xs text-destructive/80 mb-3">
        Error details: {error.includes("OpenAI") ? 
          "There was an issue with the AI service. Please check your API configuration and try again." : 
          "The company analysis service is temporarily unavailable."}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry}
        className="mt-2"
      >
        Retry Analysis
      </Button>
    </div>
  );
}
