
import { storageBucketService } from './storage/storageBucketService';
import { companyDocumentService } from './upload/companyDocumentService';
import { personalDocumentService } from './upload/personalDocumentService';

/**
 * Service for uploading documents - re-exports upload functionality from specialized services
 */
export const documentUploadService = {
  // Re-export the upload methods
  uploadDocument: companyDocumentService.uploadDocument,
  uploadPersonalDocument: personalDocumentService.uploadPersonalDocument,
  
  // Re-export storage methods
  ensureStorageBucketExists: storageBucketService.ensureStorageBucketExists
};
