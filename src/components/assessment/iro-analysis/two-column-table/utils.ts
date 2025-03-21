
import { IROFormValues, IROItem, calculateRiskScore } from "../formSchema";
import { v4 as uuidv4 } from "uuid";

// Helper function to get risk score color based on score value
export const getRiskScoreColor = (score: number) => {
  if (score <= 3) return "bg-green-100 text-green-800";
  if (score <= 6) return "bg-yellow-100 text-yellow-800";
  if (score <= 8) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

// Helper function to get impact label based on value
export const getImpactLabel = (value: number, form: IROFormValues) => {
  const scale = form.methodology.impactScale;
  return scale.find(item => item.value === value)?.label || value.toString();
};

// Helper function to get likelihood label based on value
export const getLikelihoodLabel = (value: number, form: IROFormValues) => {
  const scale = form.methodology.likelihoodScale;
  return scale.find(item => item.value === value)?.label || value.toString();
};

// Helper function to setup an item for editing
export const setupItemForEditing = (item?: IROItem) => {
  return item || {
    issueTitle: "",
    description: "",
    impact: 1,
    likelihood: 1,
    type: "risk" as const,
    category: "",
    mitigationMeasures: "",
  };
};

// Helper function to prepare an item for saving
export const prepareItemForSaving = (item: IROItem): IROItem => {
  const riskScore = calculateRiskScore(item.impact, item.likelihood);
  
  // Ensure item has an ID
  if (!item.id) {
    return {
      ...item,
      id: uuidv4(),
      riskScore
    };
  }
  
  return {
    ...item,
    riskScore
  };
};

// Helper function to parse AI-generated risks and opportunities
export interface AIGeneratedItem {
  title: string;
  description: string;
  impact: number;
  likelihood: number;
  mitigation?: string;
  enhancement?: string;
  category: string;
}

export interface AIGenerationResult {
  risks: AIGeneratedItem[];
  opportunities: AIGeneratedItem[];
}

export const parseAIGenerationResult = (result: string): IROItem[] => {
  try {
    const parsedResult: AIGenerationResult = JSON.parse(result);
    const items: IROItem[] = [];
    
    // Convert risks
    if (parsedResult.risks && Array.isArray(parsedResult.risks)) {
      parsedResult.risks.forEach(risk => {
        const item: IROItem = {
          id: uuidv4(),
          issueTitle: risk.title,
          description: risk.description,
          impact: risk.impact,
          likelihood: risk.likelihood,
          type: "risk",
          category: risk.category,
          mitigationMeasures: risk.mitigation || "",
          riskScore: calculateRiskScore(risk.impact, risk.likelihood)
        };
        items.push(item);
      });
    }
    
    // Convert opportunities
    if (parsedResult.opportunities && Array.isArray(parsedResult.opportunities)) {
      parsedResult.opportunities.forEach(opp => {
        const item: IROItem = {
          id: uuidv4(),
          issueTitle: opp.title,
          description: opp.description,
          impact: opp.impact,
          likelihood: opp.likelihood,
          type: "opportunity",
          category: opp.category,
          mitigationMeasures: opp.enhancement || "",
          riskScore: calculateRiskScore(opp.impact, opp.likelihood)
        };
        items.push(item);
      });
    }
    
    return items;
  } catch (error) {
    console.error("Error parsing AI result:", error);
    return [];
  }
};
