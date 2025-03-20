
import { FileText, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface DocumentListProps {
  documents: { name: string; url: string }[];
  onRemove?: (index: number) => void;
  className?: string;
}

export function DocumentList({ documents, onRemove, className = "" }: DocumentListProps) {
  if (!documents.length) {
    return null;
  }

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-sm">Uploaded Documents</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {documents.length} file{documents.length !== 1 ? "s" : ""}
        </span>
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {documents.map((doc, index) => (
          <div key={index} className="px-3 py-2 flex items-center justify-between border-b last:border-0 hover:bg-muted/30 transition-colors">
            <span className="text-sm truncate max-w-[70%]">{doc.name}</span>
            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-blue-500 hover:text-blue-600" 
                asChild
              >
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  View
                </a>
              </Button>
              
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                  onClick={() => onRemove(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
