
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Globe, MapPin, FileText } from "lucide-react";
import { Company } from "@/services/company/types";

interface CompanyOverviewTabProps {
  company: Company;
}

export function CompanyOverviewTab({ company }: CompanyOverviewTabProps) {
  return (
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
  );
}
