
import { Badge } from "@/components/ui/badge";
import { FeatureStatus, FeatureStatusInfo } from "@/types/training";
import { cn } from "@/lib/utils";
import { 
  Clock, AlertCircle, CheckCircle2, 
  HelpCircle, CircleDashed 
} from "lucide-react";

// Status configuration with colors, icons, and descriptions
export const statusConfig: Record<FeatureStatus, FeatureStatusInfo> = {
  "not-started": {
    status: "not-started",
    label: "Not Started",
    color: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
    description: "This feature has not been started yet"
  },
  "in-progress": {
    status: "in-progress",
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
    description: "Work on this feature is currently in progress"
  },
  "waiting-for-approval": {
    status: "waiting-for-approval",
    label: "Waiting for Approval",
    color: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
    description: "The feature is complete and waiting for approval"
  },
  "blocked": {
    status: "blocked",
    label: "Blocked",
    color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
    description: "Progress on this feature is currently blocked"
  },
  "completed": {
    status: "completed",
    label: "Completed",
    color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
    description: "This feature has been completed"
  }
};

// Status icon mapping
export const StatusIcon = ({ status }: { status: FeatureStatus }) => {
  switch (status) {
    case "not-started":
      return <CircleDashed className="h-4 w-4 mr-1" />;
    case "in-progress":
      return <Clock className="h-4 w-4 mr-1" />;
    case "waiting-for-approval":
      return <HelpCircle className="h-4 w-4 mr-1" />;
    case "blocked":
      return <AlertCircle className="h-4 w-4 mr-1" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

interface StatusBadgeProps {
  status: FeatureStatus;
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function StatusBadge({ 
  status, 
  showIcon = true, 
  className,
  children
}: StatusBadgeProps) {
  const statusInfo = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center font-medium", 
        statusInfo.color, 
        className
      )}
    >
      {showIcon && <StatusIcon status={status} />}
      {children || statusInfo.label}
    </Badge>
  );
}
