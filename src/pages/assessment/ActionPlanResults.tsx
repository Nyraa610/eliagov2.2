
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileEdit, Download, FileText, Send, Notion } from "lucide-react";
import { assessmentService } from "@/services/assessment";
import { toast } from "sonner";

export default function ActionPlanResults() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documentData, setDocumentData] = useState<any>(null);
  const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null);
  const [isConnectedToNotion, setIsConnectedToNotion] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await assessmentService.getDocumentTemplate('action_plan');
        setDocumentData(data);
        
        // Check if connected to Notion (using localStorage for demo)
        const userId = localStorage.getItem('current_user_id');
        if (userId) {
          const notionConnected = localStorage.getItem(`notion_connected_${userId}`) === 'true';
          setIsConnectedToNotion(notionConnected);
        }
      } catch (error) {
        console.error("Failed to fetch action plan data:", error);
        toast.error("Failed to load action plan results");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleExport = async (format: 'pdf' | 'word') => {
    try {
      setExporting(format);
      toast.loading(`Exporting as ${format.toUpperCase()}...`);
      
      // Prepare filename
      const companyName = documentData?.companyName || 'company';
      const cleanCompanyName = companyName.toLowerCase().replace(/\s+/g, '-');
      const dateStr = new Date().toISOString().split('T')[0];
      const fileExtension = format === 'word' ? 'docx' : 'pdf';
      const filename = `${cleanCompanyName}-action-plan-${dateStr}.${fileExtension}`;
      
      // Call the export function
      const success = await assessmentService.exportDocument(
        'action_plan', 
        documentData, 
        format, 
        filename
      );
      
      if (success) {
        toast.success(`${format.toUpperCase()} export completed`);
      } else {
        toast.error(`Failed to export as ${format}`);
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      toast.error(`Failed to export as ${format}`);
    } finally {
      setExporting(null);
    }
  };
  
  const handleBack = () => {
    navigate("/assessment/action-plan");
  };
  
  const handleExportToNotion = () => {
    navigate("/action-plan-export");
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Action Plan
          </Button>
          <h1 className="text-3xl font-bold mb-2">Action Plan Results</h1>
          <p className="text-gray-600">
            Review your action plan and export it in various formats.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleExport('word')}
            disabled={exporting !== null}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {exporting === 'word' ? 'Exporting...' : 'Export Word'}
          </Button>
          
          <Button
            variant={isConnectedToNotion ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={handleExportToNotion}
          >
            <Notion className="h-4 w-4" />
            Export to Notion
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/assessment/markdown-editor/action_plan")}
          >
            <FileEdit className="h-4 w-4" />
            Edit in Markdown Editor
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          {documentData ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">{documentData.title || 'Action Plan'}</h2>
              {documentData.companyName && (
                <p className="text-lg mb-2">For: {documentData.companyName}</p>
              )}
              <p className="text-sm text-muted-foreground mb-6">
                {documentData.date || new Date().toLocaleDateString()}
              </p>
              
              {/* Action Plan Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Objective</h3>
                  <div className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: documentData.actionPlanObjective || 'No objective defined.' }} 
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Key Actions</h3>
                  <div className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: documentData.actionPlanKeyActions || 'No key actions defined.' }} 
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Expected Benefits</h3>
                  <div className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: documentData.actionPlanBenefits || 'No benefits defined.' }} 
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Implementation Roadmap</h3>
                  <div className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: documentData.actionPlanRoadmap || 'No roadmap defined.' }} 
                  />
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Link 
                  to="/assessment/markdown-editor/action_plan" 
                  className="text-primary hover:underline"
                >
                  Click here to edit this document in the Markdown Editor
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-center py-8">No action plan data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
