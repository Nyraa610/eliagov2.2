
import { useState } from 'react';
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTabContent } from "@/components/admin/panel/OverviewTabContent";
import { UsersTabContent } from "@/components/admin/panel/UsersTabContent";
import { SettingsTabContent } from "@/components/admin/panel/SettingsTabContent";
import { TrainingTabContent } from "@/components/admin/panel/TrainingTabContent";
import { LaunchpadTabContent } from "@/components/admin/panel/LaunchpadTabContent";
import { useAdminPanelAuth } from "@/components/admin/panel/useAdminPanelAuth";

const AdminPanel = () => {
  const { isAdmin, isLoading } = useAdminPanelAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access the admin panel.</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container max-w-6xl mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">Manage your application settings and users</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="launchpad">ESG Launchpad</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <OverviewTabContent />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <UsersTabContent />
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4">
            <TrainingTabContent />
          </TabsContent>
          
          <TabsContent value="launchpad" className="space-y-4">
            <LaunchpadTabContent />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <SettingsTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;
