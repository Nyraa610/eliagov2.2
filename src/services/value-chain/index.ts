
import { valueChainBaseService } from "./valueChainBaseService";
import { valueChainExportService } from "./valueChainExportService";
import { documentService } from "./document";
import { aiService } from "./ai";
import { ValueChainData } from "@/types/valueChain";

/**
 * Combined service for all value chain related operations
 */
export const valueChainService = {
  // Load value chain data
  loadValueChain: valueChainBaseService.loadValueChain,
  
  // Save value chain data
  saveValueChain: valueChainBaseService.saveValueChain,
  
  // Version management
  getValueChainVersions: valueChainBaseService.getValueChainVersions,
  loadValueChainVersion: valueChainBaseService.loadValueChainVersion,
  setCurrentVersion: valueChainBaseService.setCurrentVersion,
  
  // Export functionality
  exportAsJson: valueChainExportService.exportAsJson,
  exportAsPNG: valueChainExportService.exportAsPNG,
  
  // Document management
  uploadDocument: documentService.uploadDocument,
  deleteDocument: documentService.deleteDocument,
  getDocuments: documentService.getDocuments,
  
  // AI generation methods
  generateValueChain: aiService.detailedGenerationService.generateValueChain,
  quickGenerateValueChain: aiService.quickGenerationService.quickGenerateValueChain
};
