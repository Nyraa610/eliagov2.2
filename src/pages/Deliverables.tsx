
import React from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { DeliverablesList } from "@/components/documents/list/DeliverablesList";
import { useClient } from "@/contexts/ClientContext";

export default function Deliverables() {
  const { currentCompany } = useClient();
  
  return (
    <UserLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Deliverables</h1>
        
        {currentCompany ? (
          <DeliverablesList companyId={currentCompany.id} />
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            Please select a company to view deliverables.
          </div>
        )}
      </div>
    </UserLayout>
  );
}
