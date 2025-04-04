
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabaseService, UserProfile, UserRole } from "@/services/base/supabaseService";

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
      const success = await supabaseService.updateUserRole(selectedUser.id, selectedRole);
      
      if (success) {
        toast({
          title: "Role updated",
          description: `${selectedUser.email}'s role has been updated to ${selectedRole}.`,
        });
        
        // Update user in the list
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { ...user, role: selectedRole } : user
        ));
        
        setIsRoleDialogOpen(false);
      } else {
        throw new Error("Failed to update role");
      }
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. Please try again.",
      });
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
  };
}
