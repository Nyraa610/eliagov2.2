
import { ValueChainData, AIGenerationPrompt } from "@/types/valueChain";

/**
 * Parameters for quick generation of value chain
 */
export interface QuickGenerateParams {
  companyName: string;
  industry: string;
  companyId: string;
  files?: File[];
  documentUrls?: string[];
}

/**
 * Response from AI processing
 */
export interface AIProcessingResponse {
  nodes: any[];
  edges: any[];
  metadata?: {
    plantUml?: string;
    [key: string]: any;
  };
}
