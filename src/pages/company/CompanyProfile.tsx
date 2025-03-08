import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Users, ChevronLeft, Settings, Globe, MapPin, FileText } from "lucide-react";
import { Company, companyService } from "@/services/companyService";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { CompanyMembers } from "@/components/company/CompanyMembers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
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
        
        // Check if user is admin by looking at their profile
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

  const handleCompanyUpdate = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    setActiveTab("overview");
    toast({
      title: "Success",
      description: "Company profile updated successfully.",
    });
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Company not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={() => navigate("/companies")} className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
          <h1 className="text-3xl font-bold">{company.name}</h1>
        </div>
        
        {isAdmin && (
          <Button onClick={() => navigate(`/company/${company.id}/settings`)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="h-40 w-40">
                    <AvatarImage src={company.logo_url || undefined} />
                    <AvatarFallback className="text-3xl">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{company.name}</h3>
                    {company.industry && (
                      <p className="text-muted-foreground">{company.industry}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.country && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{company.country}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    {company.registry_number && (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Reg: {company.registry_number}</span>
                      </div>
                    )}
                    {company.registry_city && (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Registered in {company.registry_city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
