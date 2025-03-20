
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
  }, [isAuth, loading, companyId]);

  // Wrapper for the quick generate function to pass document URLs
  const handleValueChainGenerate = async (prompt: string) => {
    const result = await handleQuickGenerate(prompt, uploadedDocuments.map(doc => doc.url));
    if (result) {
      setIsAIDialogOpen(false);
    }
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
    handleOpenUploadDialog,
    handleOpenAIDialog,
    handleDocumentUpload,
    handleRemoveDocument,
    handleQuickGenerate: handleValueChainGenerate
  };
}
