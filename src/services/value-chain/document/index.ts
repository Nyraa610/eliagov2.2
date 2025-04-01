
import { documentUploadService } from "./documentUploadService";
import { documentRetrievalService } from "./documentRetrievalService";
import { documentDeletionService } from "./documentDeletionService";
import { documentBaseService } from "./documentBaseService";

/**
 * Combined document service that exports all document-related functionality
 */
export const documentService = {
  // Upload operations
  uploadDocuments: documentUploadService.uploadDocuments,
  
  // Retrieval operations
  getDocuments: documentRetrievalService.getDocuments,
  
  // Deletion operations
  deleteDocument: documentDeletionService.deleteDocument,
  
  // Base operations
  ensureDocumentBucketExists: documentBaseService.ensureDocumentBucketExists,
  getUserCompanyId: documentBaseService.getUserCompanyId
};
