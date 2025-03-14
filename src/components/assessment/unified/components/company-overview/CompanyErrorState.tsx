
import { Button } from "@/components/ui/button";

interface CompanyErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function CompanyErrorState({ error, onRetry }: CompanyErrorStateProps) {
  return (
    <div className="bg-destructive/10 p-4 rounded-lg text-destructive">
      <h3 className="font-medium mb-1">Analysis Error</h3>
      <p className="text-sm">{error}</p>
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
