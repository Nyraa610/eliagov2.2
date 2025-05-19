
import { RefreshCw, PlusCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompanyListHeaderProps {
  title: string;
  onRefresh?: () => void;
  onCreateCompany?: () => void;
  onAddSubsidiary?: () => void;
  canAddCompany?: boolean;
  showRefresh?: boolean;
}

export function CompanyListHeader({
  title,
  onRefresh,
  onCreateCompany,
  onAddSubsidiary,
  canAddCompany = true,
  showRefresh = true,
}: CompanyListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {showRefresh && onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-9"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
        
        {canAddCompany && onCreateCompany && (
          <Button onClick={onCreateCompany} size="sm" className="h-9">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Company
          </Button>
        )}
        
        {onAddSubsidiary && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSubsidiary}
            className="h-9"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Add Subsidiary
          </Button>
        )}
      </div>
    </div>
  );
}
