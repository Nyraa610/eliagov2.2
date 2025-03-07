
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Building, User, Settings, Users, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { companyService, CompanyWithRole } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";

interface CompanyListProps {
  maxCompanies?: number;
  onAddSubsidiary?: () => void;
}

export function CompanyList({ maxCompanies, onAddSubsidiary }: CompanyListProps) {
  const [companies, setCompanies] = useState<CompanyWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching user companies");
      const data = await companyService.getUserCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      
      let errorMessage = "Failed to load companies. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("infinite recursion") || 
            error.message.includes("policy for relation")) {
          errorMessage = "Database policy error. Please refresh the page and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [toast]);

  const handleCreateCompany = () => {
    navigate("/company/new");
  };

  const handleRefresh = () => {
    fetchCompanies();
  };

  const canAddCompany = maxCompanies ? companies.length < maxCompanies : true;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Companies</h2>
        <div className="flex space-x-2">
          {error && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              title="Refresh companies"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
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
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-primary/50" />
            </div>
            <p className="text-muted-foreground">Loading companies...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Error Loading Companies</h3>
            <p className="mt-2 text-muted-foreground">
              {error}
            </p>
            <Button className="mt-4" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
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
