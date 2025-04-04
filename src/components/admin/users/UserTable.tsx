
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
import { UserCheck } from "lucide-react";
import { UserProfile } from "@/services/base/supabaseService";

interface UserTableProps {
  users: UserProfile[];
  onManageUser: (user: UserProfile) => void;
}

export function UserTable({ users, onManageUser }: UserTableProps) {
  return (
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onManageUser(user)}
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
  );
}
