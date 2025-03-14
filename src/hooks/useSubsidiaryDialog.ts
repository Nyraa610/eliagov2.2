
import { useState } from "react";

export function useSubsidiaryDialog() {
  const [showSubsidiaryDialog, setShowSubsidiaryDialog] = useState(false);
  
  const openSubsidiaryDialog = () => setShowSubsidiaryDialog(true);
  const closeSubsidiaryDialog = () => setShowSubsidiaryDialog(false);
  
  return {
    showSubsidiaryDialog,
    setShowSubsidiaryDialog,
    openSubsidiaryDialog,
    closeSubsidiaryDialog
  };
}
