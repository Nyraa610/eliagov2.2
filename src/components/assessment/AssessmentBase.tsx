
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AssessmentBaseProps {
  title: string;
  description: string;
  children: ReactNode;
  status?: "not-started" | "in-progress" | "completed";
}

export function AssessmentBase({ title, description, children, status = "not-started" }: AssessmentBaseProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "not-started":
        return <Badge variant="outline" className="ml-2">Not Started</Badge>;
      case "in-progress":
        return <Badge variant="secondary" className="ml-2">In Progress</Badge>;
      case "completed":
        // Use default variant with custom styling instead of non-existent "success" variant
        return <Badge variant="default" className="ml-2 bg-green-500 hover:bg-green-600">Completed</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl text-primary">
            {title}
            {getStatusBadge()}
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
