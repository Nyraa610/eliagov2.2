
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIGenerationPrompt } from "@/types/valueChain";
import { useAIGenerationForm } from "./ai-generation/useAIGenerationForm";
import { CompanyInfoSection } from "./ai-generation/CompanyInfoSection";
import { ProductInputList } from "./ai-generation/ProductInputList";
import { ServiceInputList } from "./ai-generation/ServiceInputList";
import { AdditionalInfoSection } from "./ai-generation/AdditionalInfoSection";
import { DialogActions } from "./ai-generation/DialogActions";
import { AIGenerationFormHeader } from "./ai-generation/AIGenerationFormHeader";

interface AutomatedValueChainBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: AIGenerationPrompt) => Promise<void>;
  companyName: string;
  industry: string;
  location: string;
  isGenerating: boolean;
}

export function AutomatedValueChainBuilder({
  open,
  onOpenChange,
  onGenerate,
  companyName,
  industry,
  location,
  isGenerating
}: AutomatedValueChainBuilderProps) {
  const {
    prompt,
    addProduct,
    removeProduct,
    updateProduct,
    addService,
    removeService,
    updateService,
    handleCompanyNameChange,
    handleIndustryChange,
    handleAdditionalInfoChange,
    handleSubmit
  } = useAIGenerationForm({
    initialCompanyName: companyName,
    initialIndustry: industry,
    onGenerate
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Automated Value Chain Builder</DialogTitle>
          <DialogDescription>
            Our AI will build a value chain optimized for ESG reporting based on your company profile and additional context.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {location && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-2">Company Profile</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Location:</span> {location || "Not specified"}
                </div>
              </div>
            </div>
          )}
          
          <CompanyInfoSection
            companyName={prompt.companyName}
            industry={prompt.industry}
            onCompanyNameChange={handleCompanyNameChange}
            onIndustryChange={handleIndustryChange}
          />
          
          <ProductInputList
            products={prompt.products}
            onAddProduct={addProduct}
            onRemoveProduct={removeProduct}
            onUpdateProduct={updateProduct}
          />
          
          <ServiceInputList
            services={prompt.services}
            onAddService={addService}
            onRemoveService={removeService}
            onUpdateService={updateService}
          />
          
          <AdditionalInfoSection
            additionalInfo={prompt.additionalInfo}
            onAdditionalInfoChange={handleAdditionalInfoChange}
          />
          
          <DialogActions
            isGenerating={isGenerating}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
