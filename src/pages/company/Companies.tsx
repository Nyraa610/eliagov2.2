
import { useState, useEffect } from "react";
import { CompanyList } from "@/components/company/CompanyList";
import { UserLayout } from "@/components/user/UserLayout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // Import supabase directly

export default function Companies() {
  const [showSubsidiaryDialog, setShowSubsidiaryDialog] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await companyService.getUserCompanies();
        console.log("Fetched companies:", data);
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

  const handleContactSales = async () => {
    try {
      // Get current user directly from supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      // Make request to the Edge Function
      const response = await fetch('https://tqvylbkavunzlckhqxcl.supabase.co/functions/v1/contact-sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          name: user?.user_metadata?.first_name + ' ' + user?.user_metadata?.last_name || 'User',
          email: user?.email || '',
          company: companies[0]?.name || 'Unknown',
          message: 'Interested in adding subsidiaries to my account'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to contact sales');
      }
      
      toast({
        title: "Request sent successfully",
        description: "Our sales team will contact you soon about adding subsidiaries.",
        variant: "default",
      });
      setShowSubsidiaryDialog(false);
    } catch (error) {
      console.error("Error contacting sales:", error);
      toast({
        title: "Error",
        description: "Failed to send your request. Please try again or email sales@eliago.com directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <UserLayout title="Companies">
      <CompanyList 
        maxCompanies={1} 
        onAddSubsidiary={() => setShowSubsidiaryDialog(true)}
      />

      <Dialog open={showSubsidiaryDialog} onOpenChange={setShowSubsidiaryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enterprise Feature</DialogTitle>
            <DialogDescription>
              Adding multiple subsidiaries is available in our Enterprise plan. Contact our sales team to upgrade.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Multiple companies and subsidiaries</p>
                <p className="text-sm text-muted-foreground">Manage multiple legal entities under one account</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Advanced team management</p>
                <p className="text-sm text-muted-foreground">Set permissions across multiple organizations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Consolidated reporting</p>
                <p className="text-sm text-muted-foreground">Generate reports across all subsidiaries</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubsidiaryDialog(false)}>Cancel</Button>
            <Button onClick={handleContactSales}>Contact Sales</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
