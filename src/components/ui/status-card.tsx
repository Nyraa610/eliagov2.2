
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, statusConfig } from "@/components/ui/status-badge";
import { FeatureStatus } from "@/types/training";
import { useState, ReactNode } from "react";

interface StatusCardProps {
  title: string;
  description: string;
  initialStatus?: FeatureStatus;
  status?: FeatureStatus; // Added to support direct status prop
  onStatusChange?: (status: FeatureStatus) => void;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode; // Added to support icon prop
  action?: ReactNode; // Added to support direct action element
}

export function StatusCard({
  title,
  description,
  initialStatus = "not-started",
  status: externalStatus, // Renamed to avoid conflict with internal state
  onStatusChange,
  actionLabel,
  onAction,
  icon,
  action
}: StatusCardProps) {
  // Use external status if provided, otherwise use internal state
  const [internalStatus, setInternalStatus] = useState<FeatureStatus>(initialStatus);
  const currentStatus = externalStatus !== undefined ? externalStatus : internalStatus;
  
  const handleStatusChange = (newStatus: FeatureStatus) => {
    setInternalStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };
  
  // Get the next status in sequence
  const getNextStatus = (currentStatus: FeatureStatus): FeatureStatus => {
    const statusOrder: FeatureStatus[] = [
      "not-started",
      "in-progress",
      "waiting-for-approval",
      "blocked",
      "completed"
    ];
    
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    return statusOrder[nextIndex];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {icon && <div className="mr-2">{icon}</div>}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <StatusBadge status={currentStatus} />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {statusConfig[currentStatus].description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {!action ? (
          <>
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange(getNextStatus(currentStatus))}
            >
              Change Status
            </Button>
            {actionLabel && onAction && (
              <Button onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </>
        ) : (
          action
        )}
      </CardFooter>
    </Card>
  );
}
