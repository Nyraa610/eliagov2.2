import { useState, useEffect } from "react";
import { DocumentsLayout } from "@/components/documents/DocumentsLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TestUploadButton } from "@/components/documents/TestUploadButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { LoadingState } from "@/components/ui/loading-state";

export default function DocumentCenter() {
  const { user, companyId } = useAuth();
  const [activeTab, setActiveTab] = useState("company");
  const [isConsultant, setIsConsultant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is a consultant
  useEffect(() => {
    const checkConsultantRole = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setIsConsultant(data?.role === 'consultant' || data?.role === 'admin');
      } catch (err) {
        console.error("Error checking consultant role:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConsultantRole();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <Card className="p-4">
          <LoadingState />
        </Card>
      </div>
    );
  }

  if (!user?.id || !companyId) {
    return (
      <div className="container mx-auto">
        <Card className="p-4">
          <p className="text-center text-muted-foreground">
            Veuillez vous connecter pour accéder au centre de documents.
          </p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      {isConsultant && (
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Troubleshooting Tools</h3>
          <TestUploadButton companyId={companyId} />
        </Card>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Document Center</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="company">Company Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="company" className="space-y-4">
              <DocumentsLayout companyId={companyId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
