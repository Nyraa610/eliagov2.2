
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useRef } from "react";

interface UploadAreaProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFilesSelected: (files: File[]) => void;
  acceptedFormats?: string;
  disabled?: boolean;
}

export function UploadArea({ 
  isDragging, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onFilesSelected,
  acceptedFormats = ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif",
  disabled = false
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
      
      // Reset the input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-primary bg-primary/5" : "border-gray-300"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        Drag and drop files here, or click to browse
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Accepted formats: PDF, DOC, PPTX, JPG, PNG, GIF
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        Browse Files
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptedFormats}
        multiple
        onChange={handleFileInputChange}
        disabled={disabled}
      />
    </div>
  );
}
