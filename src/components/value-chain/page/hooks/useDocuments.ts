
import { useState, useCallback, useEffect } from "react";
import { valueChainService } from "@/services/value-chain";
import { toast } from "sonner";

interface Document {
  url: string;
  name: string;
  id: string;
}

export function useDocuments() {
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const documents = await valueChainService.getDocuments();
      console.log("Documents loaded:", documents);
      setUploadedDocuments(documents);
    } catch (error) {
      console.error("Error loading documents:", error);
      setError("Failed to load documents");
      toast.error("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load documents when the component mounts
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

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
        // Reload documents to get the freshly uploaded ones
        await loadDocuments();
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
    isLoading,
    error,
    uploadProgress,
    loadDocuments,
    handleDocumentUpload,
    handleRemoveDocument
  };
}
