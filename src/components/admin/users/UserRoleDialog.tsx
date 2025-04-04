
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserProfile, UserRole } from "@/services/base/supabaseService";
import { Loader2 } from "lucide-react";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserProfile | null;
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onUpdateRole: () => Promise<void>;
  isUpdatingRole?: boolean;
}

export function UserRoleDialog({
  open,
  onOpenChange,
  selectedUser,
  selectedRole,
  onRoleChange,
  onUpdateRole,
  isUpdatingRole = false
}: UserRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <Select value={selectedRole} onValueChange={(value: UserRole) => onRoleChange(value)}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdatingRole}>
            Cancel
          </Button>
          <Button onClick={onUpdateRole} disabled={isUpdatingRole}>
            {isUpdatingRole ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Role'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
