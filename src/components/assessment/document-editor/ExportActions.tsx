
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Download, FileDown, Save, FileType, Loader2
} from "lucide-react";
import { assessmentService } from "@/services/assessment";
import { toast } from "sonner";

interface ExportActionsProps {
  documentData: any;
  isSaving?: boolean;
  onSave?: () => Promise<void>;
  assessmentType: string;
}

export function ExportActions({ 
  documentData, 
  isSaving = false,
  onSave,
  assessmentType
}: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleExport = async (format: 'pdf' | 'word') => {
    try {
      setIsExporting(format);
      toast.loading(`Exporting as ${format.toUpperCase()}...`);
      
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

  const handleMarkdownEditor = () => {
    navigate(`/assessment/markdown-editor/${assessmentType}`);
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        onClick={() => handleExport('pdf')}
        disabled={!!isExporting || isSaving}
        className="flex items-center gap-2"
      >
        {isExporting === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {isExporting === 'pdf' ? 'Exporting...' : 'Export as PDF'}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => handleExport('word')}
        disabled={!!isExporting || isSaving}
        className="flex items-center gap-2"
      >
        {isExporting === 'word' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        {isExporting === 'word' ? 'Exporting...' : 'Export as Word'}
      </Button>
      
      {onSave && (
        <Button 
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
      )}
      
      <Button
        variant="secondary"
        onClick={handleMarkdownEditor}
        disabled={!!isExporting || isSaving}
        className="flex items-center gap-2"
      >
        <FileType className="h-4 w-4" />
        Markdown Editor
      </Button>
    </div>
  );
}
