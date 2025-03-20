
import { useState, useEffect } from "react";
import { isAuthenticated } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { valueChainService } from "@/services/value-chain";
import { toast } from "sonner";

export function useValueChainPage() {
  const { toast: uiToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<{ url: string; name: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setIsAuth(auth);
        if (!auth) {
          uiToast({
            title: "Authentication required",
            description: "Please sign in to access this feature.",
            variant: "destructive",
          });
        } else {
          // Load documents when authenticated
          loadDocuments();
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [uiToast]);

  const loadDocuments = async () => {
    try {
      const docs = await valueChainService.getDocuments();
      setUploadedDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleOpenUploadDialog = () => {
    if (!isAuth) {
      uiToast({
        title: "Authentication required",
        description: "Please sign in to upload documents.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploadDialogOpen(true);
  };

  const handleOpenAIDialog = () => {
    if (!isAuth) {
      uiToast({
        title: "Authentication required",
        description: "Please sign in to use AI generation.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAIDialogOpen(true);
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
        setIsUploadDialogOpen(false);
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

  const handleQuickGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Start progress simulation
      const updateInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 500);
      
      // Call the value chain generator with the prompt
      const result = await valueChainService.quickGenerateValueChain(prompt, uploadedDocuments.map(doc => doc.url));
      
      clearInterval(updateInterval);
      setGenerationProgress(100);
      
      if (result) {
        toast.success("Value chain generated successfully!");
        setIsAIDialogOpen(false);
        // The ValueChainEditor component will be refreshed with the new data
      } else {
        toast.error("Failed to generate value chain");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Error generating value chain. Please try again.");
    } finally {
      setTimeout(() => {
        setGenerationProgress(0);
        setIsGenerating(false);
      }, 1000);
    }
  };

  return {
    loading,
    isAuth,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    isAIDialogOpen,
    setIsAIDialogOpen,
    isUploading,
    isGenerating,
    uploadedDocuments,
    uploadProgress,
    generationProgress,
    handleOpenUploadDialog,
    handleOpenAIDialog,
    handleDocumentUpload,
    handleRemoveDocument,
    handleQuickGenerate
  };
}
