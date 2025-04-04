
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { NotificationsTab } from "@/components/consultant/NotificationsTab";
import { useNavigate } from "react-router-dom";
import { roleService } from "@/services/base/roleService";
import { useToast } from "@/components/ui/use-toast";
import { UserLayout } from "@/components/user/UserLayout";

export default function ConsultantNotifications() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkConsultantRole = async () => {
      try {
        setIsLoading(true);
        const hasConsultantRole = await roleService.hasRole('consultant');
        
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
      <UserLayout title="Consultant Notifications">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Consultant Notifications">
      <Card>
        <CardContent className="p-6">
          <NotificationsTab />
        </CardContent>
      </Card>
    </UserLayout>
  );
}
