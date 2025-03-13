
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, Settings } from "lucide-react";
import { CompanyMembers } from "@/components/company/CompanyMembers";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { CompanyProfileHeader } from "@/components/company/profile/CompanyProfileHeader";
import { CompanyOverviewTab } from "@/components/company/profile/CompanyOverviewTab";
import { CompanyProfileLoading } from "@/components/company/profile/CompanyProfileLoading";
import { CompanyNotFound } from "@/components/company/profile/CompanyNotFound";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const { company, isAdmin, loading, handleCompanyUpdate } = useCompanyProfile(id);
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return <CompanyProfileLoading />;
  }

  if (!company) {
    return <CompanyNotFound />;
  }

  return (
    <div className="container py-8">
      <CompanyProfileHeader company={company} isAdmin={isAdmin} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">
            <Building className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Members
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CompanyOverviewTab company={company} />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="members">
              <CompanyMembers companyId={company.id} />
            </TabsContent>
            <TabsContent value="settings">
              <CompanyProfileForm company={company} onSuccess={handleCompanyUpdate} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
