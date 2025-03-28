
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

export function UsersTabContent() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage user accounts and roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              User Accounts
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage user accounts, change user roles between admin and regular user.
            </p>
            <Button 
              onClick={() => navigate("/admin/users")}
              size="sm"
            >
              Manage Users
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
