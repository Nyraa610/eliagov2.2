import { useState } from "react";

export function useDialogState() {
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAutomatedBuilderOpen, setIsAutomatedBuilderOpen] = useState(false);

  return {
    isAIDialogOpen,
    setIsAIDialogOpen,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    isAutomatedBuilderOpen,
    setIsAutomatedBuilderOpen
  };
}
