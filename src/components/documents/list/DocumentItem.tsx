
import React from "react";
import { Document } from "@/services/document";
import { Button } from "@/components/ui/button";
import { FileText, File, Trash2, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DocumentItemProps {
  document: Document;
  onDelete: (document: Document) => void;
}

export function DocumentItem({ document, onDelete }: DocumentItemProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || 
              fileType.includes('csv') || fileType.includes('xls')) {
      return <FileText className="h-6 w-6 text-emerald-500" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col border rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        {getFileIcon(document.file_type)}
        <div className="flex-1">
          <h4 className="font-medium">{document.name}</h4>
          <p className="text-sm text-muted-foreground">
            Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onDelete(document)}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
      
      <div className="mt-auto pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
          asChild
        >
          <a href={document.file_path} target="_blank" rel="noopener noreferrer" download>
            <Download className="h-4 w-4" />
            <span>Download</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
