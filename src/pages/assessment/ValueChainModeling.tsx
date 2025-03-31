
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DocumentUploadDialog } from "@/components/value-chain/DocumentUploadDialog";
import { AIQuickGenerateDialog } from "@/components/value-chain/AIQuickGenerateDialog";
import { ValueChainHeader } from "@/components/value-chain/page/ValueChainHeader";
import { IntroductionCard } from "@/components/value-chain/page/IntroductionCard";
import { DocumentsSection } from "@/components/value-chain/page/DocumentsSection";
import { AuthGate } from "@/components/value-chain/page/AuthGate";
import { useValueChainPage } from "@/components/value-chain/page/useValueChainPage";
import { ArrowRight } from "lucide-react";

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
    handleQuickGenerate,
    handleNavigateToEditor
  } = useValueChainPage();

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold text-primary mb-4">Value Chain Modeling</h1>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-primary mb-4">Value Chain Modeling</h1>
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
      
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleNavigateToEditor}
          size="lg"
          className="gap-2"
        >
          Go to Value Chain Editor <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

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
    </>
  );
}
