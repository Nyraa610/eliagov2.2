
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";

interface CompanyListHeaderProps {
  title: string;
  onRefresh: () => void;
  onCreateCompany: () => void;
  onAddSubsidiary?: () => void;
  canAddCompany: boolean;
  showRefresh: boolean;
}

export function CompanyListHeader({
  title,
  onRefresh,
  onCreateCompany,
  onAddSubsidiary,
  canAddCompany,
  showRefresh
}: CompanyListHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="flex space-x-2">
        {showRefresh && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={onRefresh}
            title="Refresh companies"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        {canAddCompany ? (
          <Button onClick={onCreateCompany}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Company
          </Button>
        ) : onAddSubsidiary ? (
          <Button variant="outline" onClick={onAddSubsidiary}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subsidiary
          </Button>
        ) : null}
      </div>
    </div>
  );
}
