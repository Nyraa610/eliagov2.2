
import { Book, Users, Award } from "lucide-react";
import { AdminCard } from "./AdminCard";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminCard
        title="Training Management"
        description="Manage courses, modules and content"
        content="Create and manage training courses, modules, and content for your users."
        icon={Book}
        actionLabel="Go to Instructor Panel"
        onClick={() => onNavigate("/admin/training", hasTrainingAccess)}
        disabled={isLoading}
      />

      <AdminCard
        title="User Management"
        description="Manage user accounts and permissions"
        content="View and manage user accounts, roles, and permissions."
        icon={Users}
        actionLabel="User Management"
        onClick={() => onNavigate("/admin/users", hasUserAccess)}
        disabled={isLoading}
      />

      <AdminCard
        title="Certification"
        description="View and manage certificates"
        content="Manage user certifications and view completion statistics."
        icon={Award}
        actionLabel="Certification Management"
        onClick={() => {
          toast({
            title: "Coming Soon",
            description: "This feature will be available in a future update."
          });
        }}
      />
    </div>
  );
}
