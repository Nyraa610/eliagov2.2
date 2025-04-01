
export { DocumentUploadDialog } from './DocumentUploadDialog';
export { UploadArea } from './UploadArea';
export { FileList } from './FileList';
export { SimpleUploadButton } from './SimpleUploadButton';
export { useDocumentUpload } from './hooks/useDocumentUpload';
export { useFileValidation } from './hooks/useFileValidation';
export type { UseDocumentUploadOptions } from './hooks/useDocumentUpload';

// Re-export document types from the service
export {
  type DocumentType,
  type UploadOptions,
  type ValidationRules,
  type UploadedDocument
} from '@/services/document/genericDocumentService';
