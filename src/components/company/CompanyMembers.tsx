
import { useState } from "react";
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

interface CompanyMembersProps {
  companyId: string;
}

export function CompanyMembers({ companyId }: CompanyMembersProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { members, loading, fetchMembers } = useMembersList(companyId);
  
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
        />
      </CardHeader>
      <CardContent>
        <MembersList 
          members={members} 
          isLoading={loading} 
          onMemberUpdate={fetchMembers} 
        />
      </CardContent>
    </Card>
  );
}
