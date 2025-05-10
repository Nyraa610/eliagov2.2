
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OnlineReportViewer } from "@/components/assessment/document-editor/OnlineReportViewer";
import { assessmentService } from "@/services/assessmentService";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

export default function OnlineReport() {
  const { assessmentType } = useParams();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documentData, setDocumentData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!assessmentType) {
          uiToast({
            title: "Error",
            description: "Assessment type is required",
            variant: "destructive"
          });
          navigate("/assessment");
          return;
        }
        
        // Fetch document data from the service
        const data = await assessmentService.getDocumentTemplate(assessmentType);
        setDocumentData(data);
      } catch (error) {
        console.error("Failed to fetch document data:", error);
        uiToast({
          title: "Error",
          description: "Failed to load document template",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assessmentType, navigate, uiToast]);
  
  const handleExport = async (format: 'pdf' | 'word') => {
    try {
      setIsExporting(format);
      
      // Prepare filename
      const companyName = documentData.companyName || 'company';
      const cleanCompanyName = companyName.toLowerCase().replace(/\s+/g, '-');
      const dateStr = new Date().toISOString().split('T')[0];
      const fileExtension = format === 'word' ? 'docx' : 'pdf';
      const filename = `${cleanCompanyName}-${assessmentType}-${dateStr}.${fileExtension}`;
      
      // Call the export function from assessmentService
      const success = await assessmentService.exportDocument(
        assessmentType || '', 
        documentData, 
        format, 
        filename
      );
      
      if (success) {
        toast.success(`${format.toUpperCase()} export completed. Your document has been downloaded.`);
      } else {
        toast.error(`Failed to export as ${format}`);
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      toast.error(`Failed to export as ${format}`);
    } finally {
      setIsExporting(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <OnlineReportViewer 
      documentData={documentData}
      onExport={handleExport}
      assessmentType={assessmentType}
    />
  );
}
