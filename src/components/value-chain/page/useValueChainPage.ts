
import { useEffect } from "react";
import { useAuthStatus } from "./hooks/useAuthStatus";
import { useDocuments } from "./hooks/useDocuments";
import { useAIGeneration } from "./hooks/useAIGeneration";
import { useDialogState } from "./hooks/useDialogState";

export function useValueChainPage() {
  const { loading, isAuth, companyId } = useAuthStatus();
  
  const {
    uploadedDocuments,
    isUploading,
    isLoading: isDocumentsLoading,
    error: documentsError,
    uploadProgress,
    loadDocuments,
    handleDocumentUpload,
    handleRemoveDocument
  } = useDocuments();
  
  const {
    isGenerating,
    generationProgress,
    handleQuickGenerate
  } = useAIGeneration();
  
  const {
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    isAIDialogOpen,
    setIsAIDialogOpen,
    handleOpenUploadDialog,
    handleOpenAIDialog
  } = useDialogState({ isAuth });

  // Load documents when authenticated and company ID is available
  useEffect(() => {
    if (isAuth && !loading && companyId) {
      loadDocuments();
    }
  }, [isAuth, loading, companyId, loadDocuments]);

  // Wrapper for the quick generate function to pass document URLs
  const handleValueChainGenerate = async (prompt: string) => {
    console.log("Starting value chain generation with prompt:", prompt);
    const documentURLs = uploadedDocuments.map(doc => doc.url);
    console.log("Using document URLs:", documentURLs);
    
    const result = await handleQuickGenerate(prompt, documentURLs);
    
    if (result) {
      console.log("Generation successful, closing dialog");
      setIsAIDialogOpen(false);
    } else {
      console.log("Generation failed, keeping dialog open");
    }
    
    return result;
  };

  return {
    loading,
    isAuth,
    companyId,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    isAIDialogOpen,
    setIsAIDialogOpen,
    isUploading,
    isGenerating,
    uploadedDocuments,
    uploadProgress,
    generationProgress,
    isDocumentsLoading,
    documentsError,
    handleOpenUploadDialog,
    handleOpenAIDialog,
    handleDocumentUpload,
    handleRemoveDocument,
    handleQuickGenerate: handleValueChainGenerate
  };
}
