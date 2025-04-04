
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabaseService, UserProfile, UserRole } from "@/services/base/supabaseService";
import { supabase } from "@/lib/supabase";
import { toast as sonnerToast } from "sonner";
import { profileService } from "@/services/base/profileService";

export function useUserManagement() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const hasAdminRole = await supabaseService.hasRole('admin');
      setIsAdmin(hasAdminRole);
      
      if (!hasAdminRole) {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You don't have permission to access this page.",
        });
        navigate("/");
      } else {
        fetchUsers();
      }
    };
    
    checkAdmin();
  }, [navigate, toast]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseService.getAllProfiles();
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle role update
  const openRoleDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const updateUserRole = async () => {
    if (!selectedUser) return;
    
    try {
      setIsUpdatingRole(true);
      
      console.log(`Updating user ${selectedUser.id} role to ${selectedRole}`);
      
      // Use the improved database function to update the role
      const { data, error } = await supabase.rpc('update_user_role', {
        user_id: selectedUser.id,
        new_role: selectedRole
      });
      
      if (error) {
        throw new Error(`Failed to update role: ${error.message}`);
      }
      
      if (data) {
        // Show success toast
        toast({
          title: "Role updated",
          description: `${selectedUser.email}'s role has been updated to ${selectedRole}.`,
        });
        
        // Update user in the local state
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { ...user, role: selectedRole } : user
        ));
        
        setIsRoleDialogOpen(false);
        
        // Refresh the user list to ensure we have the latest data
        await fetchUsers();
      } else {
        throw new Error("Failed to update role: Operation didn't complete");
      }
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update user role. Please try again.",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Handle user deletion (revoke access)
  const deleteUser = async (userToDelete: UserProfile) => {
    try {
      setIsDeleting(true);
      
      // If the user is associated with a company, remove that association
      if (userToDelete.company_id) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            company_id: null,
            is_company_admin: false 
          })
          .eq('id', userToDelete.id);
          
        if (error) {
          throw new Error(`Failed to remove user from organization: ${error.message}`);
        }
        
        // Send notification to the user
        await supabase
          .from('notifications')
          .insert({
            user_id: userToDelete.id,
            notification_type: 'message',
            title: 'Access Revoked',
            message: 'Your access to an organization has been revoked by an administrator.',
            is_read: false
          });
      
        // Update the local state to reflect the changes
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userToDelete.id 
              ? { ...user, company_id: null, is_company_admin: false } 
              : user
          )
        );
        
        toast({
          title: "Success",
          description: `${userToDelete.email} has been removed from the organization.`,
        });
      } else {
        toast({
          title: "Info",
          description: `${userToDelete.email} is not associated with any organization.`,
        });
      }
    } catch (error: any) {
      console.error("Error removing user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove user from organization.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isAdmin,
    loading,
    users: filteredUsers,
    searchQuery,
    setSearchQuery,
    selectedUser,
    selectedRole,
    setSelectedRole,
    isRoleDialogOpen,
    setIsRoleDialogOpen,
    isAddUserDialogOpen,
    setIsAddUserDialogOpen,
    openRoleDialog,
    updateUserRole,
    fetchUsers,
    deleteUser,
    isDeleting,
    isUpdatingRole
  };
}
