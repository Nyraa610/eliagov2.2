
import { useEffect } from "react";
import { UseFormWatch } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";

export function useProgressTracker(
  watch: UseFormWatch<MaterialityFormValues>,
  setProgress: (progress: number) => void
) {
  // Define tabs weights for progress calculation
  const tabWeights = {
    identify: 25,
    assess: 25,
    stakeholder: 25,
    matrix: 25
  };

  // Track form values to update progress
  useEffect(() => {
    const subscription = watch((values) => {
      if (values) {
        calculateProgress(values as MaterialityFormValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Calculate progress based on form completion
  const calculateProgress = (values: MaterialityFormValues) => {
    let completedWeight = 0;
    
    // Check which sections have data
    if (values.companyName && values.materialIssues && values.materialIssues.length > 0) {
      completedWeight += tabWeights.identify;
      
      // Check if issues have been assessed (have financial and impact materiality scores)
      const assessedIssues = values.materialIssues.filter(
        issue => issue.financialMateriality !== undefined && issue.impactMateriality !== undefined
      );
      
      if (assessedIssues.length === values.materialIssues.length) {
        completedWeight += tabWeights.assess;
      }
    }
    
    // Check stakeholder section
    if (values.stakeholderFeedback) {
      completedWeight += tabWeights.stakeholder;
    }
    
    // Matrix tab is considered partially complete if the other tabs are done
    const otherTabsComplete = completedWeight >= 75;
    if (otherTabsComplete) {
      completedWeight += tabWeights.matrix / 2; // Partially complete until submission
    }
    
    setProgress(completedWeight);
  };
}
