
import { useState } from "react";
import { AIGenerationPrompt } from "@/types/valueChain";

interface UseAIGenerationFormProps {
  initialCompanyName: string;
  initialIndustry: string;
  onGenerate: (prompt: AIGenerationPrompt) => Promise<void>;
}

export function useAIGenerationForm({ 
  initialCompanyName, 
  initialIndustry, 
  onGenerate 
}: UseAIGenerationFormProps) {
  const [prompt, setPrompt] = useState<AIGenerationPrompt>({
    companyName: initialCompanyName || '',
    industry: initialIndustry || '',
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

  const handleCompanyNameChange = (value: string) => {
    setPrompt({
      ...prompt,
      companyName: value
    });
  };

  const handleIndustryChange = (value: string) => {
    setPrompt({
      ...prompt,
      industry: value
    });
  };

  const handleAdditionalInfoChange = (value: string) => {
    setPrompt({
      ...prompt,
      additionalInfo: value
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

  return {
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
  };
}
