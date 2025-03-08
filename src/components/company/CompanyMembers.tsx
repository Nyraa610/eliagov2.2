
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
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CompanyMembersProps {
  companyId: string;
}

interface CompanyMember {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  is_company_admin: boolean;
}

export function CompanyMembers({ companyId }: CompanyMembersProps) {
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles associated with this company
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, is_company_admin')
        .eq('company_id', companyId);
        
      if (error) {
        console.error("Error fetching company members:", error);
        throw error;
      }
      
      setMembers(data as CompanyMember[]);
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
  }, [companyId]);

  const handleInvite = async () => {
    toast({
      title: "Invitation Feature",
      description: "User invitation feature will be implemented soon.",
    });
    setInviteOpen(false);
    setEmail("");
  };

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_company_admin: true })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
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

  const handleRemoveAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_company_admin: false })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
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

  const handleRemoveMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_id: null, is_company_admin: false })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
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
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.full_name?.substring(0, 2).toUpperCase() || 
                       member.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {member.full_name || member.email.split('@')[0]}
                    </div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {member.is_company_admin && <Badge variant="outline">Admin</Badge>}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!member.is_company_admin ? (
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
