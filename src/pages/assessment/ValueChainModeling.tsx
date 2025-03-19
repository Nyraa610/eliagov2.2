
import { UserLayout } from "@/components/user/UserLayout";
import { ValueChainEditor } from "@/components/value-chain/ValueChainEditor";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function ValueChainModeling() {
  return (
    <UserLayout title="Value Chain Modeling">
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
      
      <p className="text-muted-foreground mb-6">
        Model your company's value chain to better understand your activities and their impact. Use the AI generation feature to get started quickly.
      </p>

      <ValueChainEditor />
    </UserLayout>
  );
}
