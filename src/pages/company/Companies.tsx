
import { useState } from "react";
import { CompanyList } from "@/components/company/CompanyList";
import { UserLayout } from "@/components/user/UserLayout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Companies() {
  const [showSubsidiaryDialog, setShowSubsidiaryDialog] = useState(false);
  const { toast } = useToast();

  const handleContactSales = () => {
    // Here we'd typically trigger an API call to send an email
    // For now, we'll just simulate success with a toast
    toast({
      title: "Request sent successfully",
      description: "Our sales team will contact you soon about adding subsidiaries.",
      variant: "default",
    });
    setShowSubsidiaryDialog(false);
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
