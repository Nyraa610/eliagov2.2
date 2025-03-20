
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";
import { UploadArea } from "./upload/UploadArea";
import { FileList } from "./upload/FileList";
import { useFileUpload } from "./upload/useFileUpload";

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

  const handleSubmit = () => {
    onUpload(files);
    clearFiles();
  };

  const handleCancel = () => {
    clearFiles();
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
          onFilesSelected={handleFilesAdded}
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
