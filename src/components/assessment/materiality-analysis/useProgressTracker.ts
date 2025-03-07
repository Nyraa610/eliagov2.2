
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
    prioritize: 25
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
    if (values.companyName && values.materialIssues) {
      completedWeight += tabWeights.identify;
    }
    
    if (values.impactOnBusiness !== undefined && values.impactOnStakeholders !== undefined) {
      completedWeight += tabWeights.assess;
    }
    
    if (values.stakeholderFeedback) {
      completedWeight += tabWeights.stakeholder;
    }
    
    // Prioritize tab is considered if the other tabs are complete
    const otherTabsComplete = completedWeight >= 75;
    if (otherTabsComplete) {
      completedWeight += tabWeights.prioritize / 2; // Partially complete until submission
    }
    
    setProgress(completedWeight);
  };
}
