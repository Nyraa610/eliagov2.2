
import { valueChainBaseService } from "./valueChainBaseService";
import { valueChainAIService } from "./valueChainAIService";
import { valueChainExportService } from "./valueChainExportService";

/**
 * Value Chain Service - Main interface that combines all value chain related services
 */
export const valueChainService = {
  // Base operations
  saveValueChain: valueChainBaseService.saveValueChain,
  loadValueChain: valueChainBaseService.loadValueChain,
  
  // AI operations
  generateValueChain: valueChainAIService.generateValueChain,
  
  // Export/Import operations
  exportAsImage: valueChainExportService.exportAsImage,
  exportAsJson: valueChainExportService.exportAsJson
};
