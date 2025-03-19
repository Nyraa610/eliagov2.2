
import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface ToolbarSectionProps {
  children: ReactNode;
  className?: string;
  withSeparator?: boolean;
}

export function ToolbarSection({ 
  children, 
  className = "flex gap-1", 
  withSeparator = true 
}: ToolbarSectionProps) {
  return (
    <>
      <div className={className}>
        {children}
      </div>
      
      {withSeparator && <Separator orientation="vertical" className="h-8" />}
    </>
  );
}
