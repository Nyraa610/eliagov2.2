
import { UserLayout } from "@/components/user/UserLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentUploadDialog } from "@/components/value-chain/DocumentUploadDialog";
import { AIQuickGenerateDialog } from "@/components/value-chain/AIQuickGenerateDialog";
import { ValueChainHeader } from "@/components/value-chain/page/ValueChainHeader";
import { IntroductionCard } from "@/components/value-chain/page/IntroductionCard";
import { DocumentsSection } from "@/components/value-chain/page/DocumentsSection";
import { AuthGate } from "@/components/value-chain/page/AuthGate";
import { useValueChainPage } from "@/components/value-chain/page/useValueChainPage";

export default function ValueChainModeling() {
  const {
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
    handleQuickGenerate
  } = useValueChainPage();

  if (loading) {
    return (
      <UserLayout title="Value Chain Modeling">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Value Chain Modeling">
      <ValueChainHeader />
      
      <IntroductionCard 
        onOpenUploadDialog={handleOpenUploadDialog}
        onOpenAIDialog={handleOpenAIDialog}
        isUploading={isUploading}
        isGenerating={isGenerating}
        uploadProgress={uploadProgress}
        generationProgress={generationProgress}
      />
      
      {/* Always display DocumentsSection with loading and error states */}
      <DocumentsSection 
        documents={uploadedDocuments}
        onRemoveDocument={handleRemoveDocument}
        companyId={companyId}
        isLoading={isDocumentsLoading}
        error={documentsError}
      />

      <AuthGate isAuthenticated={isAuth} />
      
      <DocumentUploadDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleDocumentUpload}
      />
      
      <AIQuickGenerateDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        onGenerate={handleQuickGenerate}
        isGenerating={isGenerating}
        progress={generationProgress}
        hasDocuments={uploadedDocuments.length > 0}
        documents={uploadedDocuments}
      />
    </UserLayout>
  );
}
