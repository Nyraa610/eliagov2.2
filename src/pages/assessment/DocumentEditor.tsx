import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { DocumentEditorContainer } from "@/components/assessment/document-editor/DocumentEditorContainer";
import { DocumentHeader } from "@/components/assessment/document-editor/DocumentHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { assessmentService } from "@/services/assessment";

export default function DocumentEditor() {
  const { assessmentType } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { company } = useCompanyProfile();
  const [loading, setLoading] = useState(true);
  const [documentData, setDocumentData] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!assessmentType) {
          toast({
            title: "Error",
            description: "Assessment type is required",
            variant: "destructive"
          });
          navigate("/assessment");
          return;
        }
        
        // Fetch document data from the service
        const data = await assessmentService.getDocumentTemplate(assessmentType);
        
        // If company exists, populate the template with company data
        if (company) {
          data.companyName = company.name;
          data.industry = company.industry || "Not specified";
        }
        
        setDocumentData(data);
      } catch (error) {
        console.error("Failed to fetch document data:", error);
        toast({
          title: "Error",
          description: "Failed to load document template",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assessmentType, company, navigate, toast]);
  
  const handleBack = () => {
    navigate(`/assessment/${assessmentType}-results`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>
      </div>
      
      <DocumentHeader 
        documentData={documentData} 
        assessmentType={assessmentType || ""}
      />
      
      <Separator />
      
      <DocumentEditorContainer 
        documentData={documentData} 
        setDocumentData={setDocumentData} 
        assessmentType={assessmentType || ""}
      />
    </div>
  );
}
