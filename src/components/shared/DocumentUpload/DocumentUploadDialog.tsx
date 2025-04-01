
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentUpload, UseDocumentUploadOptions } from "./hooks/useDocumentUpload";
import { UploadArea } from "./UploadArea";
import { FileList } from "./FileList";
import { UploadedDocument } from "@/services/document/genericDocumentService";

interface DocumentUploadDialogProps extends UseDocumentUploadOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  companyId,
  folderId,
  documentType = 'standard',
  isPersonal = false,
  customPath,
  validationRules,
  title = "Upload Document",
  description,
  onUploadComplete
}: DocumentUploadDialogProps) {
  const {
    files,
    isUploading,
    uploadProgress,
    error,
    handleFilesAdded,
    removeFile,
    clearFiles,
    uploadFiles
  } = useDocumentUpload({
    companyId,
    folderId,
    documentType,
    isPersonal,
    customPath,
    validationRules,
    onUploadComplete
  });

  const handleUpload = async () => {
    const documents = await uploadFiles();
    if (documents.length > 0) {
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isUploading) {
      clearFiles();
      onOpenChange(open);
    }
  };

  const getDialogDescription = () => {
    if (description) return description;
    
    if (isPersonal) {
      return "Upload documents to your personal storage";
    } else if (folderId) {
      return "Upload documents to the selected folder";
    } else {
      return "Upload documents to your company's storage";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <UploadArea
          onFilesSelected={handleFilesAdded}
          validationRules={validationRules}
          disabled={isUploading}
        />

        <FileList
          files={files}
          onRemoveFile={removeFile}
          disabled={isUploading}
        />

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => handleDialogClose(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="gap-1"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
