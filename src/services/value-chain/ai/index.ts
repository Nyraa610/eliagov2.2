
import { detailedGenerationService } from './detailedGenerationService';
import { quickGenerationService } from './quickGenerationService';
import { QuickGenerateParams } from './types';

/**
 * Value Chain AI Service - Main interface for AI-related functionality
 */
export const valueChainAIService = {
  /**
   * Generate detailed value chain using AI
   */
  generateValueChain: detailedGenerationService.generateValueChain,
  
  /**
   * Quick generate a value chain using OpenAI
   */
  quickGenerateValueChain: quickGenerationService.quickGenerateValueChain
};

// Re-export types for easier consumption
export type { QuickGenerateParams };
