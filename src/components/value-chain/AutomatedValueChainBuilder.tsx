
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { AIGenerationPrompt } from "@/types/valueChain";
import { useAIGenerationForm } from "./ai-generation/useAIGenerationForm";
import { CompanyInfoSection } from "./ai-generation/CompanyInfoSection";
import { ProductInputList } from "./ai-generation/ProductInputList";
import { ServiceInputList } from "./ai-generation/ServiceInputList";
import { AdditionalInfoSection } from "./ai-generation/AdditionalInfoSection";
import { DialogActions } from "./ai-generation/DialogActions";

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
    handleSubmit: handleFormSubmit
  } = useAIGenerationForm({
    initialCompanyName: companyName,
    initialIndustry: industry,
    onGenerate
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFormSubmit(e);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...filesArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      const filesArray = Array.from(e.dataTransfer.files);
      setUploadedFiles([...uploadedFiles, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Automated Value Chain Builder</DialogTitle>
          <DialogDescription>
            Our AI will build a value chain optimized for ESG reporting based on your company profile and additional context.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-2">Company Profile</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Location:</span> {location || "Not specified"}
                </div>
              </div>
            </div>
          </div>
          
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
          
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context</Label>
            <Textarea
              id="context"
              placeholder="Add specific information about your value chain, business model, or particular ESG focus areas..."
              value={prompt.additionalInfo}
              onChange={(e) => handleAdditionalInfoChange(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              The more details you provide, the more accurate your value chain will be.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documents">Supporting Documents (Optional)</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                "hover:border-primary/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">
                Drag & drop files or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDFs, images, and documents are supported (max 10MB)
              </p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Uploaded files:</p>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <Card key={index} className="p-2 text-xs flex justify-between items-center">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        &times;
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Value Chain
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
