
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Company } from "@/services/company/types";
import { UserLayout } from "@/components/user/UserLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyGeneralSettings } from "@/components/company/settings/CompanyGeneralSettings";
import { CompanyAPIConnectors } from "@/components/company/settings/CompanyAPIConnectors";
import { CompanyUserManagement } from "@/components/company/settings/CompanyUserManagement";
import { useToast } from "@/hooks/use-toast";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

export default function CompanySettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company, isAdmin, loading } = useCompanyProfile(id || "");

  if (loading) {
    return (
      <UserLayout title="Company Settings">
        <div className="flex justify-center p-8">
          <p>Loading company settings...</p>
        </div>
      </UserLayout>
    );
  }

  if (!company) {
    return (
      <UserLayout title="Company Settings">
        <div className="flex justify-center p-8">
          <p>Company not found.</p>
        </div>
      </UserLayout>
    );
  }

  if (!isAdmin) {
    return (
      <UserLayout title="Company Settings">
        <div className="flex justify-center p-8">
          <p>You don't have permission to access company settings.</p>
          <Button variant="outline" onClick={() => navigate("/companies")} className="mt-4">
            Back to Companies
          </Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Company Settings">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => navigate(`/company/${id}`)} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Company
        </Button>
        <h1 className="text-2xl font-bold">{company.name} Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-connectors">API Connectors</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <CompanyGeneralSettings company={company} />
        </TabsContent>

        <TabsContent value="api-connectors">
          <CompanyAPIConnectors company={company} />
        </TabsContent>

        <TabsContent value="users">
          <CompanyUserManagement company={company} />
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}
