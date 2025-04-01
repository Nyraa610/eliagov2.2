
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { ValidationRules } from "@/services/document/genericDocumentService";

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  validationRules?: ValidationRules;
  disabled?: boolean;
  className?: string;
}

export function UploadArea({ 
  onFilesSelected,
  validationRules,
  disabled = false,
  className = ""
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  // Determine accepted formats from validation rules or use defaults
  const acceptedFormats = validationRules?.allowedTypes?.join(',') || 
    ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif";

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-primary bg-primary/5" : "border-gray-300"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        {isDragging ? "Drop files here" : "Drag and drop files here, or click to browse"}
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Accepted formats: PDF, DOC, PPTX, JPG, PNG, GIF
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
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
