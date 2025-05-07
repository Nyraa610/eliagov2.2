
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Save,
  Download,
  FileText,
  ChevronDown,
  Eye
} from "lucide-react";
import { assessmentService } from "@/services/assessmentService";
import { useNavigate } from "react-router-dom";

interface ExportActionsProps {
  documentData: any;
  isSaving: boolean;
  onSave: () => void;
  assessmentType: string;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  documentData,
  isSaving,
  onSave,
  assessmentType
}) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const navigate = useNavigate();
  
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

  const handleViewOnline = () => {
    navigate(`/assessment/report/${assessmentType}`);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={onSave}
        disabled={isSaving}
        variant="outline"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
      
      <Button
        variant="outline"
        onClick={handleViewOnline}
      >
        <Eye className="h-4 w-4 mr-2" />
        View Online
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={!!isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? `Exporting ${isExporting.toUpperCase()}...` : 'Export'}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('word')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as Word
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
