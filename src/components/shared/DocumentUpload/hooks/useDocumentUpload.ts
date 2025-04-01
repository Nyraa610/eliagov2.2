
import { useState, useCallback } from 'react';
import { genericDocumentService, ValidationRules, UploadedDocument } from '@/services/document/genericDocumentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useBucketManagement } from './useBucketManagement';
import { useUploadProgress } from './useUploadProgress';
import { useFileState } from './useFileState';

export interface UseDocumentUploadOptions {
  companyId?: string;
  folderId?: string | null;
  documentType?: 'standard' | 'personal' | 'value_chain' | 'deliverable';
  isPersonal?: boolean;
  customPath?: string;
  validationRules?: ValidationRules;
  onUploadComplete?: (documents: UploadedDocument[]) => void;
}

export function useDocumentUpload({
  companyId,
  folderId,
  documentType = 'standard',
  isPersonal = false,
  customPath,
  validationRules,
  onUploadComplete
}: UseDocumentUploadOptions = {}) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { files, handleFilesAdded: addFiles, removeFile, clearFiles } = useFileState();
  const { uploadProgress, startProgressSimulation, completeProgress, resetProgress } = useUploadProgress();
  const { ensureBucketExists } = useBucketManagement();
  
  // Process added files with validation
  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const rules = validationRules || genericDocumentService.defaultValidationRules;
    const { validFiles, invalidFiles } = genericDocumentService.validateFiles(newFiles, rules);
    
    invalidFiles.forEach(({ file, reason }) => {
      toast.error(`${file.name}: ${reason}`);
    });
    
    if (validFiles.length > 0) {
      addFiles(validFiles);
      setError(null);
    }
  }, [validationRules, addFiles]);
  
  // Handle the upload process
  const uploadFiles = useCallback(async () => {
    if (!user) {
      setError('You must be signed in to upload documents');
      return [];
    }
    
    if (files.length === 0) {
      setError('No files selected');
      return [];
    }
    
    if (isPersonal && !user.id) {
      setError('User ID is required for personal document upload');
      return [];
    }
    
    if (!isPersonal && !companyId) {
      setError('Company ID is required for company document upload');
      return [];
    }
    
    setIsUploading(true);
    setError(null);
    
    // Check if bucket exists (or create it)
    const bucketName = 'company_documents_storage';
    const bucketExists = await ensureBucketExists(bucketName);
    
    if (!bucketExists) {
      setError('Failed to access storage. Please try again later.');
      setIsUploading(false);
      return [];
    }
    
    // Start progress simulation
    const progressInterval = startProgressSimulation();
    
    try {
      const uploadOptions = {
        folderId,
        documentType,
        isPersonal,
        customPath
      };
      
      // Use company ID for company documents or user ID for personal docs
      const effectiveCompanyId = companyId || user.id;
      
      const documents = await genericDocumentService.uploadDocuments(
        files,
        effectiveCompanyId,
        uploadOptions,
        validationRules
      );
      
      clearInterval(progressInterval);
      completeProgress();
      
      // Clear files after successful upload
      setTimeout(() => {
        clearFiles();
        setIsUploading(false);
      }, 1000);
      
      // Call the completion callback if provided
      if (onUploadComplete && documents.length > 0) {
        onUploadComplete(documents);
      }
      
      return documents;
    } catch (err) {
      clearInterval(progressInterval);
      resetProgress();
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsUploading(false);
      return [];
    }
  }, [
    files,
    user,
    companyId,
    folderId,
    documentType,
    isPersonal,
    customPath,
    validationRules,
    onUploadComplete,
    clearFiles,
    ensureBucketExists,
    startProgressSimulation,
    completeProgress,
    resetProgress
  ]);
  
  return {
    files,
    isUploading,
    uploadProgress,
    error,
    handleFilesAdded,
    removeFile,
    clearFiles,
    uploadFiles
  };
}
