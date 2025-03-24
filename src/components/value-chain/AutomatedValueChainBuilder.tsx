
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AIGenerationPrompt } from "@/types/valueChain";
import { AIGenerationFormHeader } from "./ai-generation/AIGenerationFormHeader";
import { CompanyInfoSection } from "./ai-generation/CompanyInfoSection";
import { ProductInputList } from "./ai-generation/ProductInputList";
import { ServiceInputList } from "./ai-generation/ServiceInputList";
import { AdditionalInfoSection } from "./ai-generation/AdditionalInfoSection";
import { DialogActions } from "./ai-generation/DialogActions";
import { useAIGenerationForm } from "./ai-generation/useAIGenerationForm";
import { useTranslation } from "react-i18next";

interface AutomatedValueChainBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: AIGenerationPrompt) => Promise<void>;
  isGenerating: boolean;
  companyName?: string;
  industry?: string;
  location?: string;
}

export function AutomatedValueChainBuilder({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  companyName = "",
  industry = "",
  location = ""
}: AutomatedValueChainBuilderProps) {
  const { t } = useTranslation();
  
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
        <AIGenerationFormHeader />
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
