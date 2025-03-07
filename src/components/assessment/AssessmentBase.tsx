
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FeatureStatus } from "@/types/training";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AssessmentBaseProps {
  title: string;
  description: string;
  children: ReactNode;
  status?: FeatureStatus;
  progress?: number;
}

export function AssessmentBase({ 
  title, 
  description, 
  children, 
  status = "not-started",
  progress = 0
}: AssessmentBaseProps) {
  // Determine progress color based on status
  const getProgressColor = () => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "waiting-for-approval": return "bg-amber-500";
      case "blocked": return "bg-red-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl text-primary">
            {title}
            <StatusBadge status={status} className="ml-2" />
          </CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
        {progress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between mb-1 text-xs">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} indicatorColor={getProgressColor()} className="h-2" />
          </div>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
}
