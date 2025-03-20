
import { valueChainBaseService } from "./valueChainBaseService";
import { valueChainAIService } from "./valueChainAIService";
import { valueChainExportService } from "./valueChainExportService";
import { valueChainDocumentService } from "./valueChainDocumentService";

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
  exportAsJson: valueChainExportService.exportAsJson,
  
  // Document operations
  uploadDocuments: valueChainDocumentService.uploadDocuments,
  processDocuments: valueChainDocumentService.processDocuments,
  
  // Get a friendly list of acceptable document types
  getAcceptableDocumentTypes: () => ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
};
