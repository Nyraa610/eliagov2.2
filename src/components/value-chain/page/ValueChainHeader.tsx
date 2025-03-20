
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function ValueChainHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="gap-1"
      >
        <Link to="/assessment">
          <ChevronLeft className="h-4 w-4" />
          Back to Assessment
        </Link>
      </Button>
    </div>
  );
}
