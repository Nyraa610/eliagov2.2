
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserCheck, Trash2 } from "lucide-react";
import { UserProfile } from "@/services/base/supabaseService";
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

interface UserTableProps {
  users: UserProfile[];
  onManageUser: (user: UserProfile) => void;
  onDeleteUser?: (user: UserProfile) => void;
}

export function UserTable({ users, onManageUser, onDeleteUser }: UserTableProps) {
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete && onDeleteUser) {
      onDeleteUser(userToDelete);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
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
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onManageUser(user)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    {onDeleteUser && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToDelete?.email}? 
              This will revoke their access to this organization, but their account will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
