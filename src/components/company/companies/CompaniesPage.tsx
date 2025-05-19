
import { CompanyList } from "@/components/company/CompanyList";
import { SubsidiaryDialog } from "@/components/company/enterprise/SubsidiaryDialog";
import { useSubsidiaryDialog } from "@/hooks/useSubsidiaryDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CompaniesPage() {
  const { 
    showSubsidiaryDialog, 
    setShowSubsidiaryDialog, 
    openSubsidiaryDialog 
  } = useSubsidiaryDialog();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">
          Manage your companies and their profiles
        </p>
        <Button 
          onClick={() => navigate("/company/new")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create New Company
        </Button>
      </div>

      <CompanyList 
        onAddSubsidiary={openSubsidiaryDialog}
      />

      <SubsidiaryDialog 
        open={showSubsidiaryDialog} 
        onOpenChange={setShowSubsidiaryDialog} 
      />
    </div>
  );
}
