
import { FileText, ExternalLink, Trash2, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentListProps {
  documents: { name: string; url: string; created_at?: string; uploaded_by?: string }[];
  onRemove?: (index: number) => void;
  className?: string;
}

export function DocumentList({ documents, onRemove, className = "" }: DocumentListProps) {
  if (!documents.length) {
    return null;
  }

  // Format file size for display (if available)
  const getFileType = (name: string) => {
    const extension = name.split('.').pop()?.toLowerCase();
    if (!extension) return "Unknown";

    const fileTypeMap: Record<string, string> = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'xls': 'Excel Spreadsheet',
      'xlsx': 'Excel Spreadsheet',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
      'jpg': 'JPG Image',
      'jpeg': 'JPEG Image',
      'png': 'PNG Image',
      'gif': 'GIF Image',
      'txt': 'Text File'
    };

    return fileTypeMap[extension] || `${extension.toUpperCase()} File`;
  };

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-sm">Company Documents</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {documents.length} file{documents.length !== 1 ? "s" : ""}
        </span>
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {documents.map((doc, index) => (
          <div key={index} className="px-3 py-2 flex items-center justify-between border-b last:border-0 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm truncate font-medium">{doc.name}</span>
                <span className="text-xs text-muted-foreground truncate">{getFileType(doc.name)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs text-blue-500 hover:text-blue-600" 
                      asChild
                    >
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="sr-only">View</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View document</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {onRemove && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                        onClick={() => onRemove(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove document</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
