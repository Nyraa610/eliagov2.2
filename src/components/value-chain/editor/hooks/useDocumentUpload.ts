
import { useState } from "react";
import { toast } from "sonner";

export function useDocumentUpload() {
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDocumentUpload = (files: File[]) => {
    setUploadedDocuments(files);
    setIsUploading(false);
    toast.success(`${files.length} document(s) uploaded successfully`);
  };

  return {
    uploadedDocuments,
    setUploadedDocuments,
    isUploading,
    setIsUploading,
    uploadProgress,
    setUploadProgress,
    handleDocumentUpload
  };
}
