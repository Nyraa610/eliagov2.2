
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyGeneralSettings } from "@/components/company/settings/CompanyGeneralSettings";
import { CompanyAPIConnectors } from "@/components/company/settings/CompanyAPIConnectors";
import { CompanyUserManagement } from "@/components/company/settings/CompanyUserManagement";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { UserLayout } from "@/components/user/UserLayout";

export default function CompanySettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company, isAdmin, loading } = useCompanyProfile(id || "");
  
  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </UserLayout>
    );
  }
  
  if (!company) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-muted-foreground mb-4">The company you are looking for does not exist or you don't have permission to access it.</p>
          <Button onClick={() => navigate("/profile")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <h1 className="text-2xl font-bold mb-6">{`${company.name} - Settings`}</h1>
      
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate(`/company/${id}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Company
        </Button>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="api">API Connectors</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="general">
          <CompanyGeneralSettings company={company} />
        </TabsContent>
        
        {isAdmin && (
          <>
            <TabsContent value="users">
              <CompanyUserManagement company={company} />
            </TabsContent>
            <TabsContent value="api">
              <CompanyAPIConnectors company={company} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </UserLayout>
  );
}
