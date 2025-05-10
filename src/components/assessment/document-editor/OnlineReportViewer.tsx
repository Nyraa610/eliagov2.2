
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentContent } from './DocumentContent';
import { FileText, Download, FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { assessmentService } from '@/services/assessment';
import { toast as sonnerToast } from 'sonner';

interface OnlineReportViewerProps {
  documentData: any;
  onExport?: (format: 'pdf' | 'word') => void;
  assessmentType?: string;
}

export const OnlineReportViewer: React.FC<OnlineReportViewerProps> = ({
  documentData,
  onExport,
  assessmentType
}) => {
  const { toast: uiToast } = useToast();
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Load document preview when component mounts and documentData is available
    if (documentData && assessmentType) {
      loadDocumentPreview();
    }
    
    // Clean up URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [documentData, assessmentType]);
  
  const loadDocumentPreview = async () => {
    if (!documentData) return;
    
    try {
      setIsPreviewLoading(true);
      
      // Generate HTML preview of the document
      const blob = await assessmentService.getDocumentPreview(documentData);
      if (blob) {
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error("Error loading document preview:", error);
      sonnerToast.error("Failed to load document preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };
  
  // Handle template download without processing
  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const templatePath = '/DocumentTemplates/EliaGo_SustainabilityAssessment.docx';
      const response = await fetch(templatePath);
      
      if (!response.ok) {
        uiToast({
          title: "Error",
          description: "Failed to download template",
          variant: "destructive"
        });
        return;
      }
      
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "SustainabilityReport_Template.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      uiToast({
        title: "Success",
        description: "Template downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      uiToast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive"
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };
  
  const handleReloadPreview = async () => {
    // Clear current preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Load preview again
    await loadDocumentPreview();
  };
  
  if (!documentData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">No document data available</h2>
          <p className="text-gray-500 mt-2">Please create a document first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{documentData.title || "Sustainability Report"}</h1>
          <div className="text-gray-500 mt-1">
            {documentData.companyName && <span className="mr-4">Company: {documentData.companyName}</span>}
            {documentData.industry && <span>Industry: {documentData.industry}</span>}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="flex items-center gap-2"
          >
            {isDownloadingTemplate ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isDownloadingTemplate ? "Downloading..." : "Download Template"}
          </Button>
          
          {onExport && (
            <>
              <Button 
                variant="outline" 
                onClick={() => onExport('pdf')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onExport('word')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Word
              </Button>
            </>
          )}
          
          {previewUrl && (
            <Button 
              variant="outline" 
              onClick={handleReloadPreview}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Reload Preview
            </Button>
          )}
        </div>
      </div>
      
      {isPreviewLoading ? (
        <div className="flex justify-center items-center h-96 border rounded-md bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-500">Generating document preview...</p>
          </div>
        </div>
      ) : previewUrl ? (
        <div className="border rounded-md overflow-hidden bg-white">
          <iframe 
            src={previewUrl} 
            className="w-full h-screen"
            title="Document Preview" 
          />
        </div>
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <DocumentContent 
              documentData={documentData} 
              setDocumentData={() => {}} 
              readOnly={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
