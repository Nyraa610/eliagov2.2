
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
