
import { Button } from "@/components/ui/button";
import { CheckCircle, File, X } from "lucide-react";

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
}

export function FileList({ files, onRemoveFile, disabled = false }: FileListProps) {
  if (files.length === 0) return null;

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <File className="h-5 w-5 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <File className="h-5 w-5 text-red-500" />;
    } else if (file.type.includes('word')) {
      return <File className="h-5 w-5 text-blue-700" />;
    } else if (file.type.includes('powerpoint')) {
      return <File className="h-5 w-5 text-orange-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
        <span className="text-xs text-muted-foreground">
          {files.reduce((total, file) => total + file.size, 0) / (1024 * 1024) < 1 
            ? `${(files.reduce((total, file) => total + file.size, 0) / 1024).toFixed(1)} KB`
            : `${(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB`}
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-muted rounded-md text-sm hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {getFileIcon(file)}
              <div className="overflow-hidden">
                <span className="truncate block max-w-[180px] font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">{getFileSize(file.size)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(index)}
                className="h-6 w-6 p-0"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
