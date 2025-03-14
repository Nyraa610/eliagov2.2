
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, Settings } from "lucide-react";
import { CompanyMembers } from "@/components/company/CompanyMembers";
import { CompanyProfileHeader } from "@/components/company/profile/CompanyProfileHeader";
import { CompanyOverviewTab } from "@/components/company/profile/CompanyOverviewTab";
import { CompanyProfileLoading } from "@/components/company/profile/CompanyProfileLoading";
import { CompanyNotFound } from "@/components/company/profile/CompanyNotFound";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FrenchRegistrySearch } from "@/components/company/form/FrenchRegistrySearch";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/company";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const { company, isAdmin, loading, handleCompanyUpdate } = useCompanyProfile(id);
  const [activeTab, setActiveTab] = useState("overview");
  const [registryDialogOpen, setRegistryDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return <CompanyProfileLoading />;
  }

  if (!company) {
    return <CompanyNotFound />;
  }

  const handleSelectCompany = async (registryCompany: any) => {
    try {
      setIsUpdating(true);
      
      const updateData = {
        name: company.name,
        siren: registryCompany.siren,
        siret: registryCompany.siret,
        legal_form: registryCompany.legalForm,
        activity_code: registryCompany.activityCode,
        registry_status: registryCompany.status,
        official_address: registryCompany.address,
        employee_count_range: registryCompany.employeeCount,
        creation_date: registryCompany.creationDate,
        country: "France"
      };
      
      await companyService.updateCompany(company.id, updateData);
      
      toast({
        title: "Company Updated",
        description: "Official registry information has been updated successfully.",
      });
      
      setRegistryDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating company with registry data:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update company with registry information.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Official Registry Information</span>
                    <Button 
                      onClick={() => setRegistryDialogOpen(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      <span>Update from French Registry</span>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Update your company information from the official French company registry (INSEE)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {company.siren || company.siret ? (
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                        <h3 className="font-medium flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          Registry Data
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {company.siren && (
                            <div>
                              <span className="font-medium">SIREN: </span>
                              <span>{company.siren}</span>
                            </div>
                          )}
                          {company.siret && (
                            <div>
                              <span className="font-medium">SIRET: </span>
                              <span>{company.siret}</span>
                            </div>
                          )}
                          {company.legal_form && (
                            <div>
                              <span className="font-medium">Legal Form: </span>
                              <span>{company.legal_form}</span>
                            </div>
                          )}
                          {company.activity_code && (
                            <div>
                              <span className="font-medium">Activity Code: </span>
                              <span>{company.activity_code}</span>
                            </div>
                          )}
                          {company.registry_status && (
                            <div>
                              <span className="font-medium">Status: </span>
                              <span>{company.registry_status}</span>
                            </div>
                          )}
                          {company.official_address && (
                            <div className="col-span-2">
                              <span className="font-medium">Official Address: </span>
                              <span>{company.official_address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <p className="text-muted-foreground">No official registry information available</p>
                        <Button 
                          onClick={() => setRegistryDialogOpen(true)} 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Search Registry
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                  <CardDescription>
                    Update your company's basic information and details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompanyProfileForm company={company} onSuccess={handleCompanyUpdate} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="members">
              <CompanyMembers companyId={company.id} />
            </TabsContent>
          </>
        )}
      </Tabs>

      <Dialog open={registryDialogOpen} onOpenChange={setRegistryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search French Company Registry</DialogTitle>
            <DialogDescription>
              Search for your company in the official French registry to update with verified information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <FrenchRegistrySearch 
              onSelectCompany={handleSelectCompany} 
              isUpdating={isUpdating}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
