
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Globe } from "lucide-react";

export function APIDocumentation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Documentation</CardTitle>
        <CardDescription>
          Access documentation and resources for our API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-4">
          <Server className="h-6 w-6 flex-shrink-0 text-primary" />
          <div>
            <h4 className="text-base font-medium">REST API Documentation</h4>
            <p className="text-sm text-muted-foreground">
              Comprehensive documentation for our REST API endpoints
            </p>
            <Button variant="link" className="px-0">View Documentation</Button>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <Globe className="h-6 w-6 flex-shrink-0 text-primary" />
          <div>
            <h4 className="text-base font-medium">Webhooks Guide</h4>
            <p className="text-sm text-muted-foreground">
              Learn how to set up and use webhooks for real-time data
            </p>
            <Button variant="link" className="px-0">View Guide</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
