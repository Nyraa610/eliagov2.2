
import { valueChainBaseService } from "./valueChainBaseService";
import { valueChainExportService } from "./valueChainExportService";
import { documentService } from "./document";
import { ValueChainData } from "@/types/valueChain";
import { valueChainAIService } from "./ai";

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
  exportAsPNG: valueChainExportService.exportAsImage, // Fixed method name
  
  // Document management
  uploadDocuments: documentService.uploadDocuments, // Fixed method name
  deleteDocument: documentService.deleteDocument,
  getDocuments: documentService.getDocuments,
  
  // AI generation methods
  generateValueChain: valueChainAIService.generateValueChain,
  quickGenerateValueChain: valueChainAIService.quickGenerateValueChain
};
