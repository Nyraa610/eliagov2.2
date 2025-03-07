
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyWithRole } from "@/services/companyService";

interface CompanyCardProps {
  company: CompanyWithRole;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const navigate = useNavigate();

  return (
    <Card key={company.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={company.logo_url || undefined} />
            <AvatarFallback className="bg-primary text-white">
              {company.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="line-clamp-1">{company.name}</CardTitle>
            {company.industry && (
              <CardDescription>{company.industry}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1 text-sm">
          {company.country && (
            <p className="text-muted-foreground">
              Location: {company.country}
            </p>
          )}
          {company.is_admin && (
            <p className="text-sm text-primary font-medium">
              <User className="w-3 h-3 inline-block mr-1" /> 
              Administrator
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => navigate(`/company/${company.id}`)}
        >
          View Profile
        </Button>
        {company.is_admin && (
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate(`/company/${company.id}/manage`)}
          >
            <Settings className="w-4 h-4 mr-1" /> 
            Manage
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
