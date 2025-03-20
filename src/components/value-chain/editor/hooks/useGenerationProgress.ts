
import { useState } from "react";

export function useGenerationProgress() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);

  const startGenerating = () => {
    setIsGenerating(true);
    setGeneratingProgress(0);
  };

  const updateProgress = (progress: number) => {
    setGeneratingProgress(progress);
  };

  const stopGenerating = () => {
    setIsGenerating(false);
    setGeneratingProgress(0);
  };

  return {
    isGenerating,
    setIsGenerating,
    generatingProgress,
    setGeneratingProgress,
    startGenerating,
    updateProgress,
    stopGenerating
  };
}
