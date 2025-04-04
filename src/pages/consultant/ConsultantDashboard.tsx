
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ClientSelector } from "@/components/consultant/ClientSelector";
import { roleService } from "@/services/base/roleService";
import { useToast } from "@/hooks/use-toast";
import { Users, FileText, BarChart, ClipboardCheck } from "lucide-react";

export default function ConsultantDashboard() {
  const navigate = useNavigate();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isConsultant, setIsConsultant] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkRole = async () => {
      try {
        setIsLoading(true);
        const hasConsultantRole = await roleService.hasRole('consultant');
        setIsConsultant(hasConsultantRole);
        
        if (!hasConsultantRole) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have permission to access this page.",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking consultant role:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify your permissions",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkRole();
  }, [navigate, toast]);

  const handleClientChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    // Here you would typically load data specific to the selected company
    console.log("Selected company changed:", companyId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConsultant) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Consultant Dashboard</h1>
        <p className="text-muted-foreground">
          Manage client assessments and track progress
        </p>
      </div>
      
      <ClientSelector onChange={handleClientChange} />
      
      {selectedCompanyId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary" />
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-muted-foreground text-sm">Active client</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ClipboardCheck className="h-4 w-4 mr-2 text-primary" />
                Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-muted-foreground text-sm">In progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart className="h-4 w-4 mr-2 text-primary" />
                Carbon Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-muted-foreground text-sm">Generated</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-muted-foreground text-sm">Shared files</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across client accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCompanyId ? (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <div className="font-medium">ESG Diagnostic Started</div>
                  <div className="text-sm text-muted-foreground">Yesterday at 4:30 PM</div>
                </div>
                <div className="border-b pb-2">
                  <div className="font-medium">Carbon Evaluation Updated</div>
                  <div className="text-sm text-muted-foreground">2 days ago at 2:15 PM</div>
                </div>
                <div>
                  <div className="font-medium">Document Uploaded</div>
                  <div className="text-sm text-muted-foreground">Last week</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Select a client to view activities</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Client Actions</CardTitle>
            <CardDescription>Quick actions for the selected client</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCompanyId ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={() => navigate("/assessment")}>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  View Assessments
                </Button>
                <Button onClick={() => navigate("/documents")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Documents
                </Button>
                <Button onClick={() => navigate("/assessment/carbon-evaluation")}>
                  <BarChart className="h-4 w-4 mr-2" />
                  Carbon Evaluation
                </Button>
                <Button onClick={() => navigate("/consultant/notifications")}>
                  View Notifications
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Select a client to view actions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
