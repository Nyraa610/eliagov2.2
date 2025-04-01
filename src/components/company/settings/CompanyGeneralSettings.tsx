
import { Company } from "@/services/company/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, FileText, HardDrive } from "lucide-react";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { StorageManagement } from "@/components/company/settings/StorageManagement";

export interface CompanyGeneralSettingsProps {
  company: Company;
  onCompanyUpdate?: (company: Company) => void; 
}

export function CompanyGeneralSettings({ company, onCompanyUpdate }: CompanyGeneralSettingsProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile">
        <TabsList className="w-full border-b">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company Profile
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>
                Update your company's basic information and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyProfileForm 
                company={company} 
                onSuccess={onCompanyUpdate} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="storage" className="pt-4">
          <StorageManagement company={company} />
        </TabsContent>
        
        <TabsContent value="documents" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Documents</CardTitle>
              <CardDescription>
                Manage documents and files for your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Documents and file management features will be available in the document center.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
