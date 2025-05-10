
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileCheck, Loader2, X } from "lucide-react";
import { UploadArea } from "./upload/UploadArea";
import { FileList } from "./upload/FileList";
import { useFileUpload } from "./upload/useFileUpload";
import { useState } from "react";

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
  const {
    files,
    isDragging,
    handleFilesAdded,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    clearFiles
  } = useFileUpload();
  
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      await onUpload(files);
      clearFiles();
      onOpenChange(false);
    } catch (error) {
      console.error("Error during upload:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    clearFiles();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!uploading) {
        onOpenChange(isOpen);
        if (!isOpen) clearFiles();
      }
    }}>
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
          onFilesSelected={handleFilesAdded}
          disabled={uploading}
        />
        
        <FileList files={files} onRemoveFile={removeFile} disabled={uploading} />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={files.length === 0 || uploading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" />
                {files.length ? `Upload ${files.length} File${files.length > 1 ? 's' : ''}` : 'Upload'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
