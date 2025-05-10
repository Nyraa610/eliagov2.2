import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, FileText, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { assessmentService } from "@/services/assessment";
import { Link } from "react-router-dom";

interface ExportActionsProps {
  documentData: any;
  isSaving: boolean;
  onSave: () => Promise<void>;
  assessmentType: string;
}

export function ExportActions({ 
  documentData, 
  isSaving,
  onSave,
  assessmentType 
}: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { toast } = useToast();
  
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
        assessmentType, 
        documentData, 
        format, 
        filename
      );
      
      if (success) {
        toast({
          title: "Success",
          description: `${format.toUpperCase()} exported successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to export as ${format}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      toast({
        title: "Error",
        description: `Failed to export as ${format}`,
        variant: "destructive"
      });
    } finally {
      setIsExporting(null);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        disabled={isSaving}
        onClick={onSave}
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save"}
      </Button>
      
      <Button 
        variant="outline"
        onClick={() => handleExport('word')}
        disabled={isExporting !== null}
        className="flex items-center gap-2" 
      >
        {isExporting === 'word' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {isExporting === 'word' ? "Exporting..." : "Export as Word"}
      </Button>
      
      <Button 
        variant="outline"
        onClick={() => handleExport('pdf')}
        disabled={isExporting !== null}
        className="flex items-center gap-2"
      >
        {isExporting === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {isExporting === 'pdf' ? "Exporting..." : "Export as PDF"}
      </Button>
      
      <Link to={`/assessment/report/${assessmentType}`}>
        <Button variant="default" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          View Online
        </Button>
      </Link>
    </div>
  );
}
