
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersTabProps {
  onNavigate: (path: string, hasAccess: boolean) => void;
  hasUserAccess: boolean;
  isLoading: boolean;
}

export function UsersTab({
  onNavigate,
  hasUserAccess,
  isLoading
}: UsersTabProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2 flex items-center">
          <Users className="h-4 w-4 mr-2 text-primary" />
          User Management
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          View and manage user accounts, change user roles.
        </p>
        <Button
          onClick={() => onNavigate("/admin/users", hasUserAccess)}
          disabled={isLoading}
          size="sm"
        >
          Manage Users
        </Button>
      </div>
    </div>
  );
}
