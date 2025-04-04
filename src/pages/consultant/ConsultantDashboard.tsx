
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientManagementTab } from "@/components/consultant/ClientManagementTab";
import { NotificationsTab } from "@/components/consultant/NotificationsTab";
import { DocumentsTab } from "@/components/consultant/DocumentsTab";
import { AssessmentsTab } from "@/components/consultant/AssessmentsTab";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabaseService } from "@/services/base/supabaseService";
import { UserRole } from "@/services/base/profileTypes";
import { UserLayout } from "@/components/user/UserLayout";

export default function ConsultantDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("clients");

  useEffect(() => {
    const checkConsultantRole = async () => {
      try {
        setIsLoading(true);
        const hasConsultantRole = await supabaseService.hasRole('consultant' as UserRole);
        
        if (!hasConsultantRole) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have permission to access this page."
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking consultant role:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify permissions."
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConsultantRole();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <UserLayout title="Consultant Dashboard">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Consultant Dashboard">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Consultant Management Portal</CardTitle>
          <CardDescription>
            Manage clients, view notifications, and handle assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="clients">Client Management</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="documents">Client Documents</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="clients">
              <ClientManagementTab />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
            
            <TabsContent value="documents">
              <DocumentsTab />
            </TabsContent>
            
            <TabsContent value="assessments">
              <AssessmentsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </UserLayout>
  );
}
