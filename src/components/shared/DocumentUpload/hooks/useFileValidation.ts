
import { useState } from "react";
import { genericDocumentService, ValidationRules } from "@/services/document/genericDocumentService";
import { toast } from "sonner";

export function useFileValidation(validationRules?: ValidationRules) {
  const [isDragging, setIsDragging] = useState(false);
  const rules = validationRules || genericDocumentService.defaultValidationRules;
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, onFilesAdded: (files: File[]) => void) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles, onFilesAdded);
    }
  };
  
  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    onFilesAdded: (files: File[]) => void
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles, onFilesAdded);
    }
  };
  
  const processFiles = (newFiles: File[], onFilesAdded: (files: File[]) => void) => {
    const { validFiles, invalidFiles } = genericDocumentService.validateFiles(newFiles, rules);
    
    invalidFiles.forEach(({ file, reason }) => {
      toast.error(`${file.name}: ${reason}`);
    });
    
    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  };
  
  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange
  };
}
