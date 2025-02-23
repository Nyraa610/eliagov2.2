
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/lovable-uploads/bf07f304-1895-4f5e-a378-715282528884.png"
        alt="ELIA GO"
        className="h-10 w-auto"
      />
    </div>
  );
};
