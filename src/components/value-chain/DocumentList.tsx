
import { File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Document {
  url: string;
  name: string;
  id?: string;
}

interface DocumentListProps {
  documents: Document[];
  onRemove?: (index: number) => void;
  className?: string;
}

export function DocumentList({ documents, onRemove, className }: DocumentListProps) {
  if (!documents.length) {
    return <div className="text-center text-gray-500 p-4">No documents uploaded</div>;
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {documents.map((doc, index) => (
        <li 
          key={doc.id || doc.url} 
          className="flex items-center justify-between p-2 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <File className="h-4 w-4 flex-shrink-0 text-blue-500" />
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline overflow-hidden text-ellipsis whitespace-nowrap"
              title={doc.name}
            >
              {doc.name}
            </a>
          </div>
          
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-gray-500 hover:text-red-500"
              aria-label="Remove document"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
