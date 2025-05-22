import { useState, useEffect } from "react";
import { DocumentsLayout } from "@/components/documents/DocumentsLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TestUploadButton } from "@/components/documents/TestUploadButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

export default function DocumentCenter() {
  const { user, companyId } = useAuth();
  const [activeTab, setActiveTab] = useState("company");
  const [isConsultant, setIsConsultant] = useState(false);
  
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
  
  if (!user?.id) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-center text-gray-700">
              Please sign in to access the Document Center
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Troubleshooting Tools - Only show for consultants/admins */}
      {isConsultant && companyId && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Troubleshooting Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <TestUploadButton companyId={companyId} />
          </CardContent>
        </Card>
      )}
      
      {/* Main Document Center */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-2xl">Document Center</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="company">Company Documents</TabsTrigger>
              {isConsultant && <TabsTrigger value="personal">Personal Documents</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="company" className="space-y-4">
              <DocumentsLayout />
            </TabsContent>
            
            {isConsultant && (
              <TabsContent value="personal" className="space-y-4">
                <DocumentsLayout type="personal" />
              </TabsContent>
            )}
          </CardContent>
        </CardContent>
      </Card>
    </div>
  );
}
