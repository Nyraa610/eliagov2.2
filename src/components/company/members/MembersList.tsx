
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
import { MoreVertical, Shield, ShieldAlert, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

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
}

export function MembersList({ members, onMemberUpdate, isLoading }: MembersListProps) {
  const { toast } = useToast();

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
      onMemberUpdate();
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
      onMemberUpdate();
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
      onMemberUpdate();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove user from company.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <p>Loading members...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No members found</p>
      </div>
    );
  }

  return (
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
  );
}
