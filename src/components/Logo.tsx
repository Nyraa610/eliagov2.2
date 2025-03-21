
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png"
        alt="ELIA GO"
        className="h-10 w-auto"
      />
    </div>
  );
};
