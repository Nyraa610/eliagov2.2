
import { useState, useEffect } from "react";
import { valueChainService } from "@/services/value-chain";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Document {
  url: string;
  name: string;
  id?: string;
}

export function useDocuments() {
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);

  // Get the user's company ID on mount
  useEffect(() => {
    const getUserCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profile?.company_id) {
        setUserCompanyId(profile.company_id);
      }
    };

    getUserCompany();
  }, []);

  const loadDocuments = async () => {
    try {
      if (!userCompanyId) return;
      
      const docs = await valueChainService.getDocuments(userCompanyId);
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
      
      const documentUrls = await valueChainService.uploadDocuments(files, userCompanyId || undefined);
      
      clearInterval(updateInterval);
      setUploadProgress(100);
      
      if (documentUrls.length > 0) {
        // Refresh document list rather than manually updating state
        await loadDocuments();
        
        toast.success(`Successfully uploaded ${files.length} document${files.length > 1 ? 's' : ''}`);
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
        // Refresh documents instead of manipulating state directly
        await loadDocuments();
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
    handleRemoveDocument,
    userCompanyId
  };
}
