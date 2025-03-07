
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FeatureStatus } from "@/types/training";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface AssessmentBaseProps {
  title: string;
  description: string;
  children: ReactNode;
  status?: FeatureStatus;
}

export function AssessmentBase({ 
  title, 
  description, 
  children, 
  status = "not-started" 
}: AssessmentBaseProps) {
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
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
}
