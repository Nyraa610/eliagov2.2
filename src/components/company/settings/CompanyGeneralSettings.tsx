
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Company } from "@/services/companyService";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { Button } from "@/components/ui/button";
import { Search, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FrenchRegistrySearch } from "@/components/company/form/FrenchRegistrySearch";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/company";

interface CompanyGeneralSettingsProps {
  company: Company;
  onCompanyUpdate?: (company: Company) => void;
}

export function CompanyGeneralSettings({ company, onCompanyUpdate }: CompanyGeneralSettingsProps) {
  const [registryDialogOpen, setRegistryDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

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
    <div className="space-y-6">
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
          <CompanyProfileForm company={company} onSuccess={onCompanyUpdate} />
        </CardContent>
      </Card>

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
