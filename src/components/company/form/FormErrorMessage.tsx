
import { AlertCircle } from "lucide-react";

interface FormErrorMessageProps {
  message: string | null;
}

export function FormErrorMessage({ message }: FormErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className="bg-destructive/15 text-destructive rounded-md p-3 mb-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">{message}</p>
          <p className="text-xs mt-1">If this issue persists, please refresh the page or contact support.</p>
        </div>
      </div>
    </div>
  );
}
