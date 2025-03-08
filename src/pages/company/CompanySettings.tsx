
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Company, companyService } from "@/services/companyService";
import { UserLayout } from "@/components/user/UserLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyGeneralSettings } from "@/components/company/settings/CompanyGeneralSettings";
import { CompanyAPIConnectors } from "@/components/company/settings/CompanyAPIConnectors";
import { CompanyUserManagement } from "@/components/company/settings/CompanyUserManagement";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function CompanySettings() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Get company details
        const data = await companyService.getCompany(id);
        setCompany(data);
        
        // Check if user is admin
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          navigate("/login");
          return;
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_company_admin')
          .eq('id', user.user.id)
          .eq('company_id', id)
          .single();
        
        if (profileError) {
          console.error("Error checking admin status:", profileError);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.is_company_admin || false);
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        toast({
          title: "Error",
          description: "Failed to load company details.",
          variant: "destructive",
        });
        navigate("/companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, navigate, toast]);

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
