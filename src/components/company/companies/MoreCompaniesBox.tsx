
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MoreCompaniesBoxProps {
  onClick: () => void;
}

export function MoreCompaniesBox({ onClick }: MoreCompaniesBoxProps) {
  return (
    <Card 
      className="cursor-pointer border-dashed border-2 hover:border-primary/70 hover:bg-primary/5 transition-colors" 
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">Need more companies?</h3>
        <p className="text-muted-foreground">
          Upgrade to our Enterprise plan for multiple company management
        </p>
      </CardContent>
    </Card>
  );
}
