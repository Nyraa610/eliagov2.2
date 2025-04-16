
import { documentUploadService } from "./documentUploadService";
import { documentRetrievalService } from "./documentRetrievalService";
import { documentDeletionService } from "./documentDeletionService";
import { folderService } from "./folderService";
import { Document, DocumentFolder, Deliverable, DeliverableInput } from "./types";
import { genericDocumentService } from "./genericDocumentService";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Mock deliverables data stored in localStorage
const DELIVERABLES_STORAGE_KEY = "deliverables";

const initializeLocalStorage = () => {
  if (!localStorage.getItem(DELIVERABLES_STORAGE_KEY)) {
    localStorage.setItem(DELIVERABLES_STORAGE_KEY, JSON.stringify([]));
  }
};

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
  getDeliverables: documentRetrievalService.getDeliverables,
  
  // Deletion methods
  deleteDocument: documentDeletionService.deleteDocument,
  deleteFolder: documentDeletionService.deleteFolder,
  
  // Folder management methods
  createFolder: folderService.createFolder,
  
  // Generic document methods
  generic: genericDocumentService,
  
  // New method to create a deliverable
  createDeliverable: async (input: DeliverableInput): Promise<Deliverable> => {
    const deliverable: Deliverable = {
      id: uuidv4(),
      ...input,
      created_at: new Date().toISOString(),
      updated_at: null,
      status: "completed"
    };
    
    // Try to save to Supabase if available
    try {
      const { error } = await supabase
        .from('deliverables')
        .insert(deliverable);
        
      if (error) {
        console.error("Error saving deliverable to Supabase:", error);
        throw error;
      }
    } catch (err) {
      console.error("Error in Supabase deliverable creation:", err);
      
      // Fallback to localStorage
      initializeLocalStorage();
      const deliverables = JSON.parse(localStorage.getItem(DELIVERABLES_STORAGE_KEY) || '[]');
      deliverables.push(deliverable);
      localStorage.setItem(DELIVERABLES_STORAGE_KEY, JSON.stringify(deliverables));
    }
    
    return deliverable;
  }
};
