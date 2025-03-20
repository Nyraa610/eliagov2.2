
import { useEffect } from "react";
import { useAuthStatus } from "./hooks/useAuthStatus";
import { useDocuments } from "./hooks/useDocuments";
import { useAIGeneration } from "./hooks/useAIGeneration";
import { useDialogState } from "./hooks/useDialogState";

export function useValueChainPage() {
  const { loading, isAuth } = useAuthStatus();
  
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

  // Load documents when authenticated
  useEffect(() => {
    if (isAuth && !loading) {
      loadDocuments();
    }
  }, [isAuth, loading]);

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
