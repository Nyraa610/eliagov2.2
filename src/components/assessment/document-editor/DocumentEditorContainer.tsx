
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentContent } from "./DocumentContent";
import { ExportActions } from "./ExportActions";
import { TemplateSelector } from "./TemplateSelector";
import { useToast } from "@/components/ui/use-toast";
import { assessmentService } from "@/services/assessmentService";

interface DocumentEditorContainerProps {
  documentData: any;
  setDocumentData: React.Dispatch<React.SetStateAction<any>>;
  assessmentType: string;
}

export const DocumentEditorContainer: React.FC<DocumentEditorContainerProps> = ({
  documentData,
  setDocumentData,
  assessmentType
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const { toast } = useToast();
  
  const handleSaveDocument = async () => {
    try {
      setIsSaving(true);
      await assessmentService.saveDocumentData(assessmentType, documentData);
      
      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      console.error("Failed to save document:", error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTemplateChange = (template: string) => {
    // In a real implementation, this would fetch the new template
    toast({
      title: "Loading template",
      description: `Loading ${template} template...`,
    });
    
    // For now, we'll just simulate a delay
    setTimeout(() => {
      toast({
        title: "Template loaded",
        description: `${template} template loaded successfully`,
      });
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
            <TemplateSelector onTemplateChange={handleTemplateChange} />
            <ExportActions 
              documentData={documentData} 
              isSaving={isSaving}
              onSave={handleSaveDocument}
              assessmentType={assessmentType}
            />
          </div>
          
          <Tabs defaultValue="edit" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="edit">Edit Document</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-6">
              <DocumentContent 
                documentData={documentData} 
                setDocumentData={setDocumentData} 
                readOnly={false}
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-6">
              <div className="bg-white rounded-md p-6 shadow-sm border">
                <DocumentContent 
                  documentData={documentData} 
                  setDocumentData={setDocumentData} 
                  readOnly={true}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
