
import { useState } from "react";
import { DocumentUploadDialog as GenericUploadDialog } from "@/components/shared/DocumentUpload";
import { toast } from "sonner";
import { DocumentFolder } from "@/services/document";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  userId?: string;
  currentFolder?: DocumentFolder | null;
  isPersonal?: boolean;
}

export function DocumentUploadDialog({ 
  open, 
  onOpenChange, 
  companyId,
  userId,
  currentFolder,
  isPersonal = false
}: DocumentUploadDialogProps) {
  // Convert successful uploads to refresh the document listing
  const handleUploadComplete = () => {
    toast.success("Documents uploaded successfully");
    // Allow time for the upload success message to appear before closing the dialog
    setTimeout(() => {
      onOpenChange(false);
    }, 1000);
  };
  
  const title = isPersonal 
    ? "Upload Personal Document" 
    : "Upload Document";
    
  const description = isPersonal 
    ? "Upload documents to your personal storage" 
    : currentFolder 
      ? `Upload documents to folder: ${currentFolder.name}` 
      : "Upload documents to root folder";
  
  return (
    <GenericUploadDialog
      open={open}
      onOpenChange={onOpenChange}
      companyId={companyId}
      folderId={currentFolder?.id}
      isPersonal={isPersonal}
      title={title}
      description={description}
      onUploadComplete={handleUploadComplete}
    />
  );
}
