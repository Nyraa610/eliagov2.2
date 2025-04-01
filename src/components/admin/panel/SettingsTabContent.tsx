
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { InitializeStorageButton } from "@/components/documents/InitializeStorageButton";

export function SettingsTabContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>
            General platform configuration options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Settings Management</h3>
              <p className="text-muted-foreground mb-6">
                Advanced settings for platform configuration will be available in a future update.
              </p>
              <Settings className="h-8 w-8 text-muted-foreground mb-4" />
            </div>

            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Storage Management</h3>
              <p className="text-muted-foreground mb-4">
                Initialize storage folders for all companies in the platform.
              </p>
              
              <div className="flex items-center gap-4">
                <Database className="h-8 w-8 text-primary" />
                <InitializeStorageButton 
                  variant="default"
                  className="w-auto"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
