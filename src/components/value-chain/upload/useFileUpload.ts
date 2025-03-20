
import { useState } from "react";
import { FileValidator } from "./FileValidator";
import { toast } from "sonner";

export function useFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileValidationStatus, setFileValidationStatus] = useState<{[key: string]: boolean}>({});
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (newFiles: File[]) => {
    const { validFiles, validationStatus } = FileValidator.validateFiles(newFiles);
    
    setFileValidationStatus(prev => ({...prev, ...validationStatus}));
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFilesAdded = (addedFiles: File[]) => {
    processFiles(addedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    setFiles(files.filter((_, i) => i !== index));
    
    // Update validation status
    const newValidationStatus = {...fileValidationStatus};
    delete newValidationStatus[fileToRemove.name];
    setFileValidationStatus(newValidationStatus);
  };

  const clearFiles = () => {
    setFiles([]);
    setFileValidationStatus({});
  };

  return {
    files,
    isDragging,
    handleFilesAdded,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    clearFiles
  };
}
