
import { Button } from "@/components/ui/button";
import { ValueChainEditor } from "@/components/value-chain/ValueChainEditor";
import { Link } from "react-router-dom";

interface AuthGateProps {
  isAuthenticated: boolean;
}

export function AuthGate({ isAuthenticated }: AuthGateProps) {
  if (isAuthenticated) {
    return <ValueChainEditor />;
  }
  
  return (
    <div className="bg-muted p-4 rounded-md text-center">
      <p>Please sign in to access the Value Chain Modeling feature.</p>
      <Button asChild className="mt-4">
        <Link to="/login">Sign In</Link>
      </Button>
    </div>
  );
}
