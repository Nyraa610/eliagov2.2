
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useFileValidation } from "./hooks/useFileValidation";
import { ValidationRules } from "@/services/document/genericDocumentService";

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  validationRules?: ValidationRules;
  disabled?: boolean;
  acceptedFormats?: string;
}

export function UploadArea({ 
  onFilesSelected,
  validationRules,
  disabled = false,
  acceptedFormats = ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange
  } = useFileValidation(validationRules);

  const getAcceptTypesDescription = () => {
    if (validationRules?.allowedTypes?.length) {
      // Convert MIME types to more readable format
      const types = validationRules.allowedTypes.map(type => {
        if (type.includes('pdf')) return 'PDF';
        if (type.includes('word')) return 'Word';
        if (type.includes('excel')) return 'Excel';
        if (type.includes('powerpoint')) return 'PowerPoint';
        if (type.includes('image')) return type.split('/')[1].toUpperCase();
        return type;
      });
      return [...new Set(types)].join(', ');
    }
    
    return 'PDF, Office documents, and images';
  };

  const handleAreaClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDropWrapper = (e: React.DragEvent) => {
    if (!disabled) {
      handleDrop(e, onFilesSelected);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileInputChange(e, onFilesSelected);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 
        isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:bg-gray-50"
      }`}
      onDragOver={disabled ? undefined : handleDragOver}
      onDragLeave={disabled ? undefined : handleDragLeave}
      onDrop={disabled ? undefined : handleDropWrapper}
      onClick={handleAreaClick}
      aria-disabled={disabled}
    >
      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        Drag and drop files here, or click to browse
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Accepted formats: {getAcceptTypesDescription()}
      </p>
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={disabled}
        onClick={e => {
          e.stopPropagation();
          handleAreaClick();
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
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  );
}
