
import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface AdminCardProps {
  title: string;
  description: string;
  content: string;
  icon: LucideIcon;
  actionLabel: string;
  onClick: () => void;
  disabled?: boolean;
}

export function AdminCard({ 
  title, 
  description, 
  content, 
  icon: Icon, 
  actionLabel, 
  onClick, 
  disabled 
}: AdminCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Icon className="h-5 w-5 mr-2 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm">
          {content}
        </p>
      </CardContent>
      <div className="p-4 pt-0">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onClick}
          disabled={disabled}
        >
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}
