
import { Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function SettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>
          This feature will be available in a future update
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Settings Management Coming Soon</h3>
          <p className="text-muted-foreground">
            This feature is under development and will be available in a future update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
