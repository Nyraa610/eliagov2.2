
import { useState } from "react";
import { valueChainService } from "@/services/value-chain";
import { toast } from "sonner";

export function useDocuments() {
  const [uploadedDocuments, setUploadedDocuments] = useState<{ url: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadDocuments = async () => {
    try {
      const docs = await valueChainService.getDocuments();
      setUploadedDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleDocumentUpload = async (files: File[]) => {
    if (!files.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const updateInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress < 95 ? newProgress : prev;
        });
      }, 300);
      
      const documentUrls = await valueChainService.uploadDocuments(files);
      
      clearInterval(updateInterval);
      setUploadProgress(100);
      
      if (documentUrls.length > 0) {
        const newDocuments = documentUrls.map((url, index) => ({
          url,
          name: files[index].name
        }));
        
        setUploadedDocuments(prev => [...prev, ...newDocuments]);
        toast.success(`Successfully uploaded ${files.length} document${files.length > 1 ? 's' : ''}`);
        
        // Refresh document list
        await loadDocuments();
      } else {
        toast.error("Failed to upload documents");
      }
    } catch (error) {
      console.error("Document upload error:", error);
      toast.error("Error uploading documents. Please try again.");
    } finally {
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    }
  };
  
  const handleRemoveDocument = async (index: number) => {
    try {
      const docToRemove = uploadedDocuments[index];
      const success = await valueChainService.deleteDocument(docToRemove.url);
      
      if (success) {
        setUploadedDocuments(prev => {
          const newDocs = [...prev];
          newDocs.splice(index, 1);
          return newDocs;
        });
        toast.success("Document removed successfully");
      } else {
        toast.error("Failed to remove document");
      }
    } catch (error) {
      console.error("Error removing document:", error);
      toast.error("Error removing document. Please try again.");
    }
  };

  return {
    uploadedDocuments,
    setUploadedDocuments,
    isUploading,
    setIsUploading,
    uploadProgress,
    setUploadProgress,
    loadDocuments,
    handleDocumentUpload,
    handleRemoveDocument
  };
}
