
import { CreditCard, Users, BookOpen, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OverviewTabProps {
  onNavigate: (path: string, hasAccess: boolean) => void;
  hasTrainingAccess: boolean;
  hasUserAccess: boolean;
  isLoading: boolean;
}

export function OverviewTab({
  onNavigate,
  hasTrainingAccess,
  hasUserAccess,
  isLoading
}: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2 flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          Training Management
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create and manage training courses and content
        </p>
        <Button
          onClick={() => onNavigate("/admin/training", hasTrainingAccess)}
          disabled={isLoading}
          size="sm"
        >
          Go to Training Panel
        </Button>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2 flex items-center">
          <Users className="h-4 w-4 mr-2 text-primary" />
          User Management
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage user accounts and roles
        </p>
        <Button
          onClick={() => onNavigate("/admin/users", hasUserAccess)}
          disabled={isLoading}
          size="sm"
        >
          Manage Users
        </Button>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2 flex items-center">
          <Database className="h-4 w-4 mr-2 text-primary" />
          Emission Factors
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage ADEME Base Carbone emission factors
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
