import { motion } from "framer-motion";
import { RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { AddUserDialog } from "@/components/admin/users/add-user";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserRoleDialog } from "@/components/admin/users/UserRoleDialog";
import { UserSearchBar } from "@/components/admin/users/UserSearchBar";
import { useUserManagement } from "@/components/admin/users/useUserManagement";

export default function UserManagement() {
  const navigate = useNavigate();
  const {
    isAdmin,
    loading,
    users,
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
  } = useUserManagement();

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
              <div className="mt-4">
                <UserSearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
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
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No users found matching your search." : "No users found."}
                    </div>
                  ) : (
                    <UserTable 
                      users={users}
                      onManageUser={openRoleDialog}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Role Update Dialog */}
          <UserRoleDialog
            open={isRoleDialogOpen}
            onOpenChange={setIsRoleDialogOpen}
            selectedUser={selectedUser}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            onUpdateRole={updateUserRole}
          />

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
