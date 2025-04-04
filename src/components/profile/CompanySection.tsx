
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/services/base/profileTypes";
import { Building, Plus, Loader2, Lock } from "lucide-react";
import { companyService } from "@/services/company";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompanySectionProps {
  profile: UserProfile | null;
  onCompanyCreated: () => void;
}

export function CompanySection({ profile, onCompanyCreated }: CompanySectionProps) {
  const [companyName, setCompanyName] = useState("");
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      // Use the userCompanyService.createUserCompany method directly to ensure the user is linked to the company
      const companyData = { 
        name: companyName,
        // Adding additional minimal information to ensure data validation passes
        country: profile?.country || "Not specified"
      };
      
      console.log("Attempting to create company with data:", companyData);
      
      const newCompany = await companyService.createCompany(companyData);
      
      console.log("Company created successfully:", newCompany);
      
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      
      setCompanyName("");
      // Refresh profile to show the new company
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
          Company Information
        </CardTitle>
        <CardDescription>
          {profile?.company_id ? "Your company details" : "Add your company information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profile?.company_id ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md">
              <p className="text-green-700 dark:text-green-300">
                You're associated with a company: {profile.company_name || "Your Company"}
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => navigate(`/company/${profile.company_id}`)} variant="default">
                View Company
              </Button>
              
              <Alert className="mt-4 bg-muted/50 border-dashed">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <AlertDescription className="text-sm text-muted-foreground">
                    Need to manage multiple companies? Upgrade to our <span className="font-medium">Enterprise Plan</span> to create and manage multiple companies and their subsidiaries.
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
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
                  Create Company
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
