
import { useEffect } from "react";
import { UseFormWatch } from "react-hook-form";
import { CarbonEvaluationFormValues } from "./formSchema";

export function useProgressTracker(
  watch: UseFormWatch<CarbonEvaluationFormValues>,
  setProgress: (progress: number) => void
) {
  // Define tabs weights for progress calculation
  const tabWeights = {
    "company-info": 25,
    "direct-emissions": 25,
    "indirect-emissions": 25,
    "transportation": 25
  };

  // Track form values to update progress
  useEffect(() => {
    const subscription = watch((values) => {
      if (values) {
        calculateProgress(values as CarbonEvaluationFormValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Calculate progress based on form completion
  const calculateProgress = (values: CarbonEvaluationFormValues) => {
    let completedWeight = 0;
    
    // Company info
    if (values.companyName && values.yearOfEvaluation) {
      completedWeight += tabWeights["company-info"];
    }
    
    // Direct emissions
    if (values.scope1Emissions) {
      completedWeight += tabWeights["direct-emissions"];
    }
    
    // Indirect emissions
    if (values.scope2Emissions && values.scope3Emissions) {
      completedWeight += tabWeights["indirect-emissions"];
    }
    
    // Transportation
    if (values.transportationUsage) {
      completedWeight += tabWeights["transportation"];
    }
    
    setProgress(completedWeight);
  };
}
