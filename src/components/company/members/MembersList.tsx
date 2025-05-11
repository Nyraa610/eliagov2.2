
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Shield, 
  ShieldAlert, 
  UserMinus, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompanyMember {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  is_company_admin: boolean;
}

interface MembersListProps {
  members: CompanyMember[];
  onMemberUpdate: () => void;
  isLoading: boolean;
  companyId: string;
}

export function MembersList({ members, onMemberUpdate, isLoading, companyId }: MembersListProps) {
  const { toast } = useToast();
  const [memberToRemove, setMemberToRemove] = useState<CompanyMember | null>(null);
  const [isPromoting, setIsPromoting] = useState<string | null>(null);
  const [isDemoting, setIsDemoting] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      setIsPromoting(userId);
      const { error } = await supabase
        .from('profiles')
        .update({ is_company_admin: true })
        .eq('id', userId)
        .eq('company_id', companyId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Member promoted",
        description: "User has been promoted to admin.",
      });
      onMemberUpdate();
    } catch (error) {
      console.error("Error promoting member:", error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin.",
        variant: "destructive",
      });
    } finally {
      setIsPromoting(null);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      setIsDemoting(userId);
      const { error } = await supabase
        .from('profiles')
        .update({ is_company_admin: false })
        .eq('id', userId)
        .eq('company_id', companyId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Admin rights removed",
        description: "Admin rights have been removed from this user.",
      });
      onMemberUpdate();
    } catch (error) {
      console.error("Error removing admin rights:", error);
      toast({
        title: "Error",
        description: "Failed to remove admin rights.",
        variant: "destructive",
      });
    } finally {
      setIsDemoting(null);
    }
  };

  const confirmRemoveMember = (member: CompanyMember) => {
    setMemberToRemove(member);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      setIsRemoving(memberToRemove.id);
      const { error } = await supabase
        .from('profiles')
        .update({ company_id: null, is_company_admin: false })
        .eq('id', memberToRemove.id)
        .eq('company_id', companyId);
        
      if (error) {
        throw error;
      }
      
      // Send notification to the user (optional)
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: memberToRemove.id,
            notification_type: 'message',
            title: 'Company Membership Removed',
            message: 'Your access to a company has been revoked by an administrator.',
            is_read: false
          });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Continue execution even if notification fails
      }
      
      toast({
        title: "Member removed",
        description: "User has been removed from the company.",
      });
      
      setMemberToRemove(null);
      onMemberUpdate();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove user from company.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Loading members...</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <p className="mt-4 text-muted-foreground">No members found</p>
        <p className="text-sm text-muted-foreground">
          Invite members to collaborate in this company
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 rounded-md border">
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
              {member.is_company_admin && 
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              }
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!member.is_company_admin ? (
                    <DropdownMenuItem 
                      onClick={() => handlePromoteToAdmin(member.id)}
                      disabled={isPromoting === member.id}
                      className="flex items-center"
                    >
                      {isPromoting === member.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Make Admin
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={() => handleRemoveAdmin(member.id)}
                      disabled={isDemoting === member.id}
                      className="flex items-center"
                    >
                      {isDemoting === member.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 mr-2" />
                      )}
                      Remove Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => confirmRemoveMember(member)}
                    className="text-destructive focus:text-destructive flex items-center"
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

      <AlertDialog 
        open={!!memberToRemove} 
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove company member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.full_name || memberToRemove?.email} from this company?
              This will revoke their access to all company resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember}
              disabled={!!isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
