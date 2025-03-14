
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyList } from "@/components/company/CompanyList";
import { UserLayout } from "@/components/user/UserLayout";
import { SubsidiaryDialog } from "@/components/company/enterprise/SubsidiaryDialog";

export default function Companies() {
  const [showSubsidiaryDialog, setShowSubsidiaryDialog] = useState(false);
  const navigate = useNavigate();

  return (
    <UserLayout title="Companies">
      <CompanyList 
        maxCompanies={1} 
        onAddSubsidiary={() => setShowSubsidiaryDialog(true)}
      />

      <SubsidiaryDialog 
        open={showSubsidiaryDialog} 
        onOpenChange={setShowSubsidiaryDialog} 
      />
    </UserLayout>
  );
}
