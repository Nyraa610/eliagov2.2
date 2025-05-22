import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentsLayout } from "@/components/DocumentsLayout";
import { TestUploadButton } from "@/components/TestUploadButton";

interface DocumentCenterProps {
  isConsultant?: boolean;
  companyId?: string;
}

const DocumentCenter: React.FC<DocumentCenterProps> = ({ isConsultant = false, companyId }) => {
  const [activeTab, setActiveTab] = useState("company");

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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentCenter;
