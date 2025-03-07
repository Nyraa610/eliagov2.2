
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Building, User, Settings, Users, ChevronRight } from "lucide-react";
import { companyService, CompanyWithRole } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";

interface CompanyListProps {
  maxCompanies?: number;
  onAddSubsidiary?: () => void;
}

export function CompanyList({ maxCompanies, onAddSubsidiary }: CompanyListProps) {
  const [companies, setCompanies] = useState<CompanyWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await companyService.getUserCompanies();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast({
          title: "Error",
          description: "Failed to load companies. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [toast]);

  const handleCreateCompany = () => {
    navigate("/company/new");
  };

  const canAddCompany = maxCompanies ? companies.length < maxCompanies : true;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Companies</h2>
        {canAddCompany ? (
          <Button onClick={handleCreateCompany}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Company
          </Button>
        ) : onAddSubsidiary ? (
          <Button variant="outline" onClick={onAddSubsidiary}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subsidiary
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <Building className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Companies</h3>
            <p className="mt-2 text-muted-foreground">
              You haven't created or joined any companies yet.
            </p>
            <Button className="mt-4" onClick={handleCreateCompany}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
