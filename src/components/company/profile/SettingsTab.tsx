import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Company } from "@/services/companyService";
import { CompanyGeneralSettings } from "@/components/company/settings/CompanyGeneralSettings";
import { CompanyAPIConnectors } from "@/components/company/settings/CompanyAPIConnectors";
import { Button } from "@/components/ui/button";
import { BarChart3, FileSpreadsheet, MessageSquare } from "lucide-react";

interface SettingsTabProps {
  company: Company;
  onCompanyUpdate: (company: Company) => void;
}

export function SettingsTab({ company, onCompanyUpdate }: SettingsTabProps) {
  return (
    <div className="space-y-8">
      <CompanyGeneralSettings 
        company={company} 
        onCompanyUpdate={onCompanyUpdate} 
      />
      
      <h2 className="text-2xl font-bold tracking-tight mb-6">Tools & Integrations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CRM & Sales</CardTitle>
            <CardDescription>
              Connect to your CRM and manage sales opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="h-24">
            <p className="text-sm text-muted-foreground">
              Analyze customer interactions for sustainability opportunities
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to={`/company/${company.id}/sales-opportunities`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Sales Opportunities
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reporting</CardTitle>
            <CardDescription>
              Advanced reporting and data visualization
            </CardDescription>
          </CardHeader>
          <CardContent className="h-24">
            <p className="text-sm text-muted-foreground">
              Generate reports on your sustainability metrics and progress
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              Sustainability Reports
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Import/Export</CardTitle>
            <CardDescription>
              Import or export your company data
            </CardDescription>
          </CardHeader>
          <CardContent className="h-24">
            <p className="text-sm text-muted-foreground">
              Import data from spreadsheets or export to various formats
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import/Export Data
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <CompanyAPIConnectors company={company} />
    </div>
  );
}
