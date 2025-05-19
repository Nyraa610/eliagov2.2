
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TestUploadButton } from "@/components/documents/TestUploadButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalDocumentsList } from "@/components/documents/list/PersonalDocumentsList";
import { DeliverablesList } from "@/components/documents/list/DeliverablesList";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DocumentCenter() {
  const { user, companyId } = useAuth();
  const [activeTab, setActiveTab] = useState("company");
  const [isConsultant, setIsConsultant] = useState(false);
  
  // Check if user is a consultant
  useEffect(() => {
    const checkConsultantRole = async () => {
      if (!user?.id) return;
      
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
      }
    };
    
    checkConsultantRole();
  }, [user?.id]);
  
  return (
    <div className="container mx-auto">
      {companyId && user?.id && (
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Troubleshooting Tools</h3>
          <TestUploadButton companyId={companyId} />
        </Card>
      )}
      
      {user?.id && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Document Center</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="company">Company Documents</TabsTrigger>
                <TabsTrigger value="personal">Personal Documents</TabsTrigger>
                {isConsultant && <TabsTrigger value="deliverables">Elia Go Deliverables</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="company" className="space-y-4">
                <PersonalDocumentsList userId={user.id} />
              </TabsContent>
              
              <TabsContent value="personal" className="space-y-4">
                <PersonalDocumentsList userId={user.id} />
              </TabsContent>
              
              {isConsultant && (
                <TabsContent value="deliverables" className="space-y-4">
                  {companyId && <DeliverablesList companyId={companyId} />}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
