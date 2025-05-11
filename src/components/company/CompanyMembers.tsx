
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { MembersList } from "./members/MembersList";
import { InviteMemberDialog } from "./members/InviteMemberDialog";
import { useMembersList } from "./members/useMembersList";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface CompanyMembersProps {
  companyId: string;
}

export function CompanyMembers({ companyId }: CompanyMembersProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { members, pendingInvitations, loading, error, fetchMembers } = useMembersList(companyId);
  
  // Automatically refresh members list when the component mounts
  useEffect(() => {
    fetchMembers();
  }, [companyId]);
  
  // Handle successful invitation by refreshing the members list
  const handleInviteSuccess = () => {
    console.log("Invitation successful, refreshing members list");
    fetchMembers();
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Company Members</CardTitle>
          <CardDescription>Manage who has access to this company</CardDescription>
        </div>
        <InviteMemberDialog 
          open={inviteOpen} 
          onOpenChange={setInviteOpen}
          companyId={companyId}
          onInviteSuccess={handleInviteSuccess}
        />
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={fetchMembers}>
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <MembersList 
          members={members} 
          pendingInvitations={pendingInvitations}
          isLoading={loading} 
          onMemberUpdate={fetchMembers} 
          companyId={companyId}
        />
      </CardContent>
    </Card>
  );
}
