
import { CompanyList } from "@/components/company/CompanyList";
import { SubsidiaryDialog } from "@/components/company/enterprise/SubsidiaryDialog";
import { useSubsidiaryDialog } from "@/hooks/useSubsidiaryDialog";

export function CompaniesPage() {
  const { 
    showSubsidiaryDialog, 
    setShowSubsidiaryDialog, 
    openSubsidiaryDialog 
  } = useSubsidiaryDialog();

  return (
    <>
      <CompanyList 
        maxCompanies={1} 
        onAddSubsidiary={openSubsidiaryDialog}
      />

      <SubsidiaryDialog 
        open={showSubsidiaryDialog} 
        onOpenChange={setShowSubsidiaryDialog} 
      />
    </>
  );
}
