
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/services/base/profileTypes";
import { Building, Plus, Loader2 } from "lucide-react";
import { companyService } from "@/services/company";

interface CompanySectionProps {
  profile: UserProfile | null;
  onCompanyCreated: () => void;
}

export function CompanySection({ profile, onCompanyCreated }: CompanySectionProps) {
  const [companyName, setCompanyName] = useState("");
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [userCompanies, setUserCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user's companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const companies = await companyService.getUserCompanies();
        setUserCompanies(companies);
      } catch (error) {
        console.error("Error fetching user companies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanies();
  }, [profile?.id]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Company name is required",
      });
      return;
    }

    setIsCreatingCompany(true);
    try {
      const companyData = { 
        name: companyName,
        country: "Not specified"
      };
      
      console.log("Attempting to create company with data:", companyData);
      
      const newCompany = await companyService.createCompany(companyData);
      
      console.log("Company created successfully:", newCompany);
      
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      
      setCompanyName("");
      // Refresh to show the new company
      onCompanyCreated();
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create company",
      });
    } finally {
      setIsCreatingCompany(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Management
        </CardTitle>
        <CardDescription>
          Create and manage your companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {userCompanies.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Your Companies</h3>
                  <div className="grid gap-3">
                    {userCompanies.map((company) => (
                      <div 
                        key={company.id} 
                        className="p-3 border rounded-md bg-background flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{company.name}</p>
                          {company.is_admin && (
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/company/${company.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateCompany} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">New Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <Button type="submit" disabled={isCreatingCompany} className="flex gap-2 items-center">
                  {isCreatingCompany ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create New Company
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
