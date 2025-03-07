
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, statusConfig } from "@/components/ui/status-badge";
import { FeatureStatus } from "@/types/training";
import { useState } from "react";

interface StatusCardProps {
  title: string;
  description: string;
  initialStatus?: FeatureStatus;
  onStatusChange?: (status: FeatureStatus) => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusCard({
  title,
  description,
  initialStatus = "not-started",
  onStatusChange,
  actionLabel,
  onAction
}: StatusCardProps) {
  const [status, setStatus] = useState<FeatureStatus>(initialStatus);
  
  const handleStatusChange = (newStatus: FeatureStatus) => {
    setStatus(newStatus);
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
          <CardTitle className="text-lg">{title}</CardTitle>
          <StatusBadge status={status} />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {statusConfig[status].description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => handleStatusChange(getNextStatus(status))}
        >
          Change Status
        </Button>
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
