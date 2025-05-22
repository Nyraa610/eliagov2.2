import { documentUploadService } from "./documentUploadService";
import { documentRetrievalService } from "./documentRetrievalService";
import { documentDeletionService } from "./documentDeletionService";
import { folderService } from "./folderService";
import { Document, DocumentFolder } from "./types";
import { genericDocumentService } from "./genericDocumentService";
import { supabase } from "@/lib/supabase";

/**
 * Unified document service that combines all document-related functionality
 */
export const documentService = {
  // Upload methods
  uploadDocument: documentUploadService.uploadDocument,
  uploadPersonalDocument: documentUploadService.uploadPersonalDocument,
  ensureStorageBucketExists: documentUploadService.ensureStorageBucketExists,
  
  // Retrieval methods
  getDocuments: documentRetrievalService.getDocuments,
  getPersonalDocuments: documentRetrievalService.getPersonalDocuments,
  getFolders: documentRetrievalService.getFolders,
  getFolder: documentRetrievalService.getFolder,
  
  // Deletion methods
  deleteDocument: documentDeletionService.deleteDocument,
  deleteFolder: documentDeletionService.deleteFolder,
  
  // Folder management methods
  createFolder: folderService.createFolder,
  
  // Generic document methods
  generic: genericDocumentService
};
