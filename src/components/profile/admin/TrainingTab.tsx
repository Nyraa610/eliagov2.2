
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrainingTabProps {
  onNavigate: (path: string, hasAccess: boolean) => void;
  hasTrainingAccess: boolean;
  isLoading: boolean;
}

export function TrainingTab({
  onNavigate,
  hasTrainingAccess,
  isLoading
}: TrainingTabProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2 flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          Training Management
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create and manage training content, courses, and modules.
        </p>
        <Button
          onClick={() => onNavigate("/admin/training", hasTrainingAccess)}
          disabled={isLoading}
          size="sm"
        >
          Go to Training Panel
        </Button>
      </div>
    </div>
  );
}
