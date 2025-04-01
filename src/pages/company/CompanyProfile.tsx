
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, Settings } from "lucide-react";
import { CompanyMembers } from "@/components/company/CompanyMembers";
import { CompanyProfileHeader } from "@/components/company/profile/CompanyProfileHeader";
import { CompanyOverviewTab } from "@/components/company/profile/CompanyOverviewTab";
import { CompanyProfileLoading } from "@/components/company/profile/CompanyProfileLoading";
import { CompanyNotFound } from "@/components/company/profile/CompanyNotFound";
import { SettingsTab } from "@/components/company/profile/SettingsTab";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { UserLayout } from "@/components/user/UserLayout";

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const { company, isAdmin, loading, handleCompanyUpdate } = useCompanyProfile(id);
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <UserLayout>
        <CompanyProfileLoading />
      </UserLayout>
    );
  }

  if (!company) {
    return (
      <UserLayout>
        <CompanyNotFound />
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <CompanyProfileHeader company={company} isAdmin={isAdmin} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">
            <Building className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Members
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CompanyOverviewTab company={company} />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="settings" className="space-y-6">
              <SettingsTab company={company} onCompanyUpdate={handleCompanyUpdate} />
            </TabsContent>
            <TabsContent value="members">
              <CompanyMembers companyId={company.id} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </UserLayout>
  );
}
