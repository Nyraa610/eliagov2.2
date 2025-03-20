
import { useState, useCallback } from "react";
import { valueChainService } from "@/services/value-chain";
import { toast } from "sonner";

interface Document {
  url: string;
  name: string;
  id?: string;
}

export function useDocuments() {
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadDocuments = useCallback(async () => {
    try {
      const documents = await valueChainService.getDocuments();
      setUploadedDocuments(documents);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load documents");
    }
  }, []);

  const handleDocumentUpload = useCallback(async (files: File[]) => {
    if (!files.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 500);
      
      // Upload files
      const uploadedUrls = await valueChainService.uploadDocuments(files);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      if (uploadedUrls.length > 0) {
        toast.success(`${files.length} document(s) uploaded successfully`);
        
        // Reload documents to get the freshly uploaded ones
        await loadDocuments();
      } else {
        toast.error("Failed to upload documents");
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Error uploading documents");
    } finally {
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    }
  }, [loadDocuments]);

  const handleRemoveDocument = useCallback(async (index: number) => {
    const documentToRemove = uploadedDocuments[index];
    if (!documentToRemove || !documentToRemove.url) return;
    
    try {
      const success = await valueChainService.deleteDocument(documentToRemove.url);
      
      if (success) {
        setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
        toast.success("Document removed successfully");
      } else {
        toast.error("Failed to remove document");
      }
    } catch (error) {
      console.error("Error removing document:", error);
      toast.error("Error removing document");
    }
  }, [uploadedDocuments]);

  return {
    uploadedDocuments,
    isUploading,
    uploadProgress,
    loadDocuments,
    handleDocumentUpload,
    handleRemoveDocument
  };
}
