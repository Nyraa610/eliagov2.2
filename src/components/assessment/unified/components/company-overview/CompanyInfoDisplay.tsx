
import { CompanyAnalysisResult } from "@/services/companyAnalysisService";
import { Info, Users, MapPin, CalendarDays } from "lucide-react";

interface CompanyInfoDisplayProps {
  companyInfo: CompanyAnalysisResult;
}

export function CompanyInfoDisplay({ companyInfo }: CompanyInfoDisplayProps) {
  if (!companyInfo) return null;
  
  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium text-lg mb-2">Company Overview</h3>
        <p className="text-sm text-muted-foreground">{companyInfo.overview}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Industry</h4>
            <p className="text-sm text-muted-foreground">{companyInfo.industry}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Company Size</h4>
            <p className="text-sm text-muted-foreground">{companyInfo.employeeCount} employees</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Headquarters</h4>
            <p className="text-sm text-muted-foreground">{companyInfo.location}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Founded</h4>
            <p className="text-sm text-muted-foreground">{companyInfo.yearFounded}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Mission</h4>
        <p className="text-sm text-muted-foreground">{companyInfo.mission}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Products & Services</h4>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {companyInfo.productsServices.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">History</h4>
        <p className="text-sm text-muted-foreground">{companyInfo.history}</p>
      </div>
    </div>
  );
}
