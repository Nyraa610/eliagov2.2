
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { AdminHeader } from "./admin/AdminHeader";
import { OverviewTab } from "./admin/OverviewTab";
import { TrainingTab } from "./admin/TrainingTab";
import { UsersTab } from "./admin/UsersTab";
import { SettingsTab } from "./admin/SettingsTab";

export function AdminSection() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading, hasTrainingAccess, hasUserAccess } = useAdminPermissions();

  const handleNavigate = (path: string, hasAccess: boolean) => {
    if (hasAccess) {
      navigate(path);
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this area."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <AdminHeader />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <OverviewTab 
              onNavigate={handleNavigate}
              hasTrainingAccess={hasTrainingAccess}
              hasUserAccess={hasUserAccess}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="training">
            <TrainingTab 
              onNavigate={handleNavigate}
              hasTrainingAccess={hasTrainingAccess}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="users">
            <UsersTab 
              onNavigate={handleNavigate}
              hasUserAccess={hasUserAccess}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
