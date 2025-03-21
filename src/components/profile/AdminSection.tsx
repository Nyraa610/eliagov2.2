
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Book, Users, Settings, Award, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { supabaseService } from "@/services/base/supabaseService";

export function AdminSection() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasTrainingAccess, setHasTrainingAccess] = useState(false);
  const [hasUserAccess, setHasUserAccess] = useState(false);

  useEffect(() => {
    const checkAdminPermissions = async () => {
      try {
        setIsLoading(true);
        const profile = await supabaseService.getUserProfile();
        
        // Admin role should have access to everything
        if (profile?.role === 'admin') {
          setHasTrainingAccess(true);
          setHasUserAccess(true);
        }
      } catch (error) {
        console.error("Error checking admin permissions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify admin permissions"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminPermissions();
  }, [toast]);

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
        <div className="flex items-center space-x-4 mb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{t('profile.adminSection')}</CardTitle>
            <CardDescription>
              {t('profile.adminTools')}
            </CardDescription>
          </div>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Book className="h-5 w-5 mr-2 text-primary" />
                    Training Management
                  </CardTitle>
                  <CardDescription>
                    Manage courses, modules and content
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    Create and manage training courses, modules, and content for your users.
                  </p>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleNavigate("/admin/training", hasTrainingAccess)}
                    disabled={isLoading}
                  >
                    Go to Instructor Panel
                  </Button>
                </div>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    View and manage user accounts, roles, and permissions.
                  </p>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleNavigate("/admin/users", hasUserAccess)}
                    disabled={isLoading}
                  >
                    User Management
                  </Button>
                </div>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Certification
                  </CardTitle>
                  <CardDescription>
                    View and manage certificates
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    Manage user certifications and view completion statistics.
                  </p>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: "This feature will be available in a future update."
                      });
                    }}
                  >
                    Certification Management
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="training">
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
                      onClick={() => handleNavigate("/admin/training", hasTrainingAccess)}
                      size="sm"
                      disabled={isLoading}
                    >
                      Go to Instructor Panel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
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
                      onClick={() => handleNavigate("/admin/users", hasUserAccess)}
                      size="sm"
                      disabled={isLoading}
                    >
                      Manage Users
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
