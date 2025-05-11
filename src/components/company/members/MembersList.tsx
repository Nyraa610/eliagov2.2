
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
  Loader2,
  Clock
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompanyMember {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  is_company_admin: boolean;
  role?: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface MembersListProps {
  members: CompanyMember[];
  onMemberUpdate: () => void;
  isLoading: boolean;
  companyId: string;
  pendingInvitations: PendingInvitation[];
}

export function MembersList({ 
  members, 
  onMemberUpdate, 
  isLoading, 
  companyId,
  pendingInvitations 
}: MembersListProps) {
  const { toast } = useToast();
  const [memberToRemove, setMemberToRemove] = useState<CompanyMember | null>(null);
  const [invitationToCancel, setInvitationToCancel] = useState<PendingInvitation | null>(null);
  const [isPromoting, setIsPromoting] = useState<string | null>(null);
  const [isDemoting, setIsDemoting] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      setIsPromoting(userId);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_company_admin: true,
          role: 'admin'
        })
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
        .update({ 
          is_company_admin: false,
          role: 'user'
        })
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

  const confirmCancelInvitation = (invitation: PendingInvitation) => {
    setInvitationToCancel(invitation);
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

  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return;
    
    try {
      setIsCancelling(invitationToCancel.id);
      
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationToCancel.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled.",
      });
      
      setInvitationToCancel(null);
      onMemberUpdate();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(null);
    }
  };

  const renderRoleBadge = (member: CompanyMember) => {
    if (member.is_company_admin || member.role === 'admin') {
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    
    if (member.role === 'consultant') {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
          <Shield className="h-3 w-3 mr-1" />
          Consultant
        </Badge>
      );
    }
    
    return null;
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

  const renderEmptyState = () => {
    if (activeTab === "active" && members.length === 0) {
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
    
    if (activeTab === "pending" && pendingInvitations.length === 0) {
      return (
        <div className="text-center py-8 border rounded-md">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <p className="mt-4 text-muted-foreground">No pending invitations</p>
          <p className="text-sm text-muted-foreground">
            All invitations have been accepted or there are no pending invitations
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Active Members
            <Badge variant="secondary" className="ml-2">{members.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Invitations
            <Badge variant="secondary" className="ml-2">{pendingInvitations.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {members.length === 0 ? renderEmptyState() : (
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
                    {renderRoleBadge(member)}
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
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingInvitations.length === 0 ? renderEmptyState() : (
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => {
                const roleDisplay = 
                  invitation.role === 'admin' ? 'Company Administrator' : 
                  invitation.role === 'consultant' ? 'Consultant' : 'Company Member';
                
                return (
                  <div key={invitation.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {invitation.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {invitation.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="text-xs text-muted-foreground">
                            Invited {new Date(invitation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        {roleDisplay}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => confirmCancelInvitation(invitation)}
                        disabled={isCancelling === invitation.id}
                      >
                        {isCancelling === invitation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
      
      <AlertDialog 
        open={!!invitationToCancel} 
        onOpenChange={(open) => !open && setInvitationToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation sent to {invitationToCancel?.email}?
              They will no longer be able to join using this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!isCancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelInvitation}
              disabled={!!isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Invitation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
