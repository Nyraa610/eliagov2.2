
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UseDialogStateProps {
  isAuth: boolean;
}

export function useDialogState({ isAuth }: UseDialogStateProps) {
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  const handleOpenUploadDialog = () => {
    if (!isAuth) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload documents.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploadDialogOpen(true);
  };

  const handleOpenAIDialog = () => {
    if (!isAuth) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use AI generation.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAIDialogOpen(true);
  };

  return {
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    isAIDialogOpen,
    setIsAIDialogOpen,
    handleOpenUploadDialog,
    handleOpenAIDialog
  };
}
