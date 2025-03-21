
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/lovable-uploads/68339245-bb39-49e9-befe-1c3bf86a589b.png"
        alt="ELIA GO"
        className="h-10 w-auto"
      />
    </div>
  );
};
