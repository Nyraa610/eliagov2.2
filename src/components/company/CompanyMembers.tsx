import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreVertical, UserPlus, Shield, ShieldAlert, UserMinus } from "lucide-react";
import { companyMemberService } from "@/services/companyMemberService";
import { useToast } from "@/hooks/use-toast";

interface CompanyMembersProps {
  companyId: string;
}

export function CompanyMembers({ companyId }: CompanyMembersProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await companyMemberService.getMembers(companyId);
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load company members.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [companyId, toast]);

  const handleInvite = async () => {
    toast({
      title: "Invitation Feature",
      description: "User invitation feature will be implemented soon.",
    });
    setInviteOpen(false);
    setEmail("");
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      await companyMemberService.updateMember(memberId, true);
      toast({
        title: "Member promoted",
        description: "User has been promoted to admin.",
      });
      fetchMembers();
    } catch (error) {
      console.error("Error promoting member:", error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAdmin = async (memberId: string) => {
    try {
      await companyMemberService.updateMember(memberId, false);
      toast({
        title: "Admin rights removed",
        description: "Admin rights have been removed from this user.",
      });
      fetchMembers();
    } catch (error) {
      console.error("Error removing admin rights:", error);
      toast({
        title: "Error",
        description: "Failed to remove admin rights.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await companyMemberService.removeMember(memberId);
      toast({
        title: "Member removed",
        description: "User has been removed from the company.",
      });
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove user from company.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Company Members</CardTitle>
          <CardDescription>Manage who has access to this company</CardDescription>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Enter the email address of the person you want to invite to this company.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <p>Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No members found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.user?.full_name?.substring(0, 2).toUpperCase() || 
                       member.user?.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {member.user?.full_name || member.user?.email.split('@')[0]}
                    </div>
                    <div className="text-sm text-muted-foreground">{member.user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {member.is_admin && <Badge variant="outline">Admin</Badge>}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!member.is_admin ? (
                        <DropdownMenuItem onClick={() => handlePromoteToAdmin(member.id)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleRemoveAdmin(member.id)}>
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Remove Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
