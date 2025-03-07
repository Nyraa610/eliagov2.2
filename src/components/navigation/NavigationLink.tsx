
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavigationLinkProps {
  to: string;
  isActive: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const NavigationLink = ({ 
  to, 
  isActive, 
  onClick, 
  children,
  className = ""
}: NavigationLinkProps) => {
  return (
    <Link to={to} onClick={onClick}>
      <Button 
        variant={isActive ? "default" : "ghost"}
        className={`${isActive ? "bg-primary text-white" : ""} ${className}`}
      >
        {children}
      </Button>
    </Link>
  );
};
