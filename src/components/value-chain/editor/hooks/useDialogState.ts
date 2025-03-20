
import { useState } from "react";

export function useDialogState() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAutomatedBuilderOpen, setIsAutomatedBuilderOpen] = useState(false);

  return {
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    isAutomatedBuilderOpen,
    setIsAutomatedBuilderOpen
  };
}
