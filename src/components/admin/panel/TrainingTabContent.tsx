
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Book } from "lucide-react";

export function TrainingTabContent() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Management</CardTitle>
        <CardDescription>
          Access the instructor panel to manage courses, modules, and content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <Book className="h-4 w-4 mr-2 text-primary" />
              Course Management
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create, edit, and manage courses for your users.
            </p>
            <Button 
              onClick={() => navigate("/admin/training")}
              size="sm"
            >
              Go to Instructor Panel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
