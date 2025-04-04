
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabaseService, UserProfile, UserRole } from "@/services/base/supabaseService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCheck, Search, RefreshCw, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { AddUserDialog } from "@/components/admin/users/AddUserDialog";

export default function UserManagement() {
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 page-header-spacing pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary">User Management</h1>
              <p className="text-muted-foreground">Manage user accounts and roles</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button
                variant="outline"
                onClick={fetchUsers}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setIsAddUserDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/panel")}
              >
                Back to Admin Panel
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>
                View and manage user accounts and their roles
              </CardDescription>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users by email or name..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No users found matching your search." : "No users found."}
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{user.full_name || "—"}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  user.role === "admin" 
                                    ? "bg-primary/10 text-primary" 
                                    : user.role === "consultant"
                                    ? "bg-blue-100 text-blue-800"
                                    : user.role === "client_admin" 
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {user.role}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openRoleDialog(user)}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Manage
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Role Update Dialog */}
          <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update User Role</DialogTitle>
                <DialogDescription>
                  {selectedUser?.email}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Role</label>
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selectedUser?.role === "admin" 
                        ? "bg-primary/10 text-primary" 
                        : selectedUser?.role === "consultant"
                        ? "bg-blue-100 text-blue-800"
                        : selectedUser?.role === "client_admin" 
                        ? "bg-amber-100 text-amber-800"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {selectedUser?.role}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium mb-1">
                      New Role
                    </label>
                    <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="client_admin">Client Admin</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateUserRole}>
                  Update Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add User Dialog */}
          <AddUserDialog 
            open={isAddUserDialogOpen}
            onOpenChange={setIsAddUserDialogOpen}
            onUserAdded={fetchUsers}
          />
        </motion.div>
      </div>
    </div>
  );
}
