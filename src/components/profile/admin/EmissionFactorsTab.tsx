
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmissionFactorsTabProps {
  onNavigate: (path: string, hasAccess: boolean) => void;
  isLoading: boolean;
}

export function EmissionFactorsTab({
  onNavigate,
  isLoading
}: EmissionFactorsTabProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2 flex items-center">
          <Database className="h-4 w-4 mr-2 text-primary" />
          Emission Factors
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Import and manage ADEME Base Carbone emission factors for carbon evaluations.
        </p>
        <Button
          onClick={() => onNavigate("/admin/emission-factors", true)}
          disabled={isLoading}
          size="sm"
        >
          Manage Emission Factors
        </Button>
      </div>
    </div>
  );
}
