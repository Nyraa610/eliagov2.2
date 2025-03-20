
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";
import { UploadArea } from "./upload/UploadArea";
import { FileList } from "./upload/FileList";
import { FileValidator } from "./upload/FileValidator";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onUpload
}: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileValidationStatus, setFileValidationStatus] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const handleFileInputChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.target?.files) {
        const newFiles = Array.from(customEvent.detail.target.files as FileList);
        processNewFiles(newFiles);
      }
    };

    document.addEventListener('fileInputChange', handleFileInputChange);
    return () => {
      document.removeEventListener('fileInputChange', handleFileInputChange);
    };
  }, []);

  const processNewFiles = (newFiles: File[]) => {
    const { validFiles, validationStatus } = FileValidator.validateFiles(newFiles);
    
    setFileValidationStatus(prev => ({...prev, ...validationStatus}));
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      processNewFiles(newFiles);
    }
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
      processNewFiles(droppedFiles);
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

  const handleSubmit = () => {
    onUpload(files);
    setFiles([]);
    setFileValidationStatus({});
  };

  const handleCancel = () => {
    setFiles([]);
    setFileValidationStatus({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload supporting documents for your value chain analysis. We accept PDF, Office documents, and image files.
          </DialogDescription>
        </DialogHeader>
        
        <UploadArea 
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
        
        <FileList files={files} onRemoveFile={removeFile} />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={files.length === 0}
            className="gap-1"
          >
            <FileCheck className="h-4 w-4" />
            {files.length ? `Upload ${files.length} File${files.length > 1 ? 's' : ''}` : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
