
import { valueChainBaseService } from "./valueChainBaseService";
import { valueChainAIService } from "./ai";
import { valueChainExportService } from "./valueChainExportService";
import { documentService } from "./document";

/**
 * Value Chain Service - Main interface that combines all value chain related services
 */
export const valueChainService = {
  // Base operations
  saveValueChain: valueChainBaseService.saveValueChain,
  loadValueChain: valueChainBaseService.loadValueChain,
  
  // AI operations
  generateValueChain: valueChainAIService.generateValueChain,
  quickGenerateValueChain: valueChainAIService.quickGenerateValueChain,
  
  // Export/Import operations
  exportAsImage: valueChainExportService.exportAsImage,
  exportAsJson: valueChainExportService.exportAsJson,
  
  // Document operations
  uploadDocuments: documentService.uploadDocuments,
  getDocuments: documentService.getDocuments,
  deleteDocument: documentService.deleteDocument,
  
  // Get a friendly list of acceptable document types
  getAcceptableDocumentTypes: () => ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
};
