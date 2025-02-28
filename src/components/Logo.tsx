
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/lovable-uploads/4a9d4c8d-12c6-4ba9-87b5-132f6c06c33a.png"
        alt="ELIA GO"
        className="h-10 w-auto"
      />
    </div>
  );
};
