
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { AIGenerationPrompt } from "@/types/valueChain";

interface AIGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: AIGenerationPrompt) => Promise<void>;
  isGenerating: boolean;
  companyName: string;
  industry: string;
}

export function AIGenerationDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  companyName,
  industry
}: AIGenerationDialogProps) {
  const [prompt, setPrompt] = useState<AIGenerationPrompt>({
    companyName: companyName || '',
    industry: industry || '',
    products: [''],
    services: [''],
    additionalInfo: ''
  });

  const addProduct = () => {
    setPrompt({
      ...prompt,
      products: [...prompt.products, '']
    });
  };

  const removeProduct = (index: number) => {
    setPrompt({
      ...prompt,
      products: prompt.products.filter((_, i) => i !== index)
    });
  };

  const updateProduct = (index: number, value: string) => {
    const updatedProducts = [...prompt.products];
    updatedProducts[index] = value;
    setPrompt({
      ...prompt,
      products: updatedProducts
    });
  };

  const addService = () => {
    setPrompt({
      ...prompt,
      services: [...prompt.services, '']
    });
  };

  const removeService = (index: number) => {
    setPrompt({
      ...prompt,
      services: prompt.services.filter((_, i) => i !== index)
    });
  };

  const updateService = (index: number, value: string) => {
    const updatedServices = [...prompt.services];
    updatedServices[index] = value;
    setPrompt({
      ...prompt,
      services: updatedServices
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty products and services
    const filteredPrompt = {
      ...prompt,
      products: prompt.products.filter(p => p.trim() !== ''),
      services: prompt.services.filter(s => s.trim() !== '')
    };
    await onGenerate(filteredPrompt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Value Chain with AI
          </DialogTitle>
          <DialogDescription>
            Provide information about your company to generate a value chain model
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                value={prompt.companyName} 
                onChange={e => setPrompt({...prompt, companyName: e.target.value})}
                placeholder="Enter company name" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input 
                id="industry" 
                value={prompt.industry} 
                onChange={e => setPrompt({...prompt, industry: e.target.value})}
                placeholder="e.g. Manufacturing, Technology, Retail" 
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Products</Label>
            {prompt.products.map((product, index) => (
              <div key={`product-${index}`} className="flex gap-2 mb-2">
                <Input
                  value={product}
                  onChange={e => updateProduct(index, e.target.value)}
                  placeholder={`Product ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProduct(index)}
                  disabled={prompt.products.length <= 1}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProduct}
              className="mt-1"
            >
              Add Product
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label>Services</Label>
            {prompt.services.map((service, index) => (
              <div key={`service-${index}`} className="flex gap-2 mb-2">
                <Input
                  value={service}
                  onChange={e => updateService(index, e.target.value)}
                  placeholder={`Service ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeService(index)}
                  disabled={prompt.services.length <= 1}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addService}
              className="mt-1"
            >
              Add Service
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additional-info">Additional Information</Label>
            <Textarea
              id="additional-info"
              value={prompt.additionalInfo || ''}
              onChange={e => setPrompt({...prompt, additionalInfo: e.target.value})}
              placeholder="Provide any additional information that might help generate a more accurate value chain"
              rows={3}
            />
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
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
