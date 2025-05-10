
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { genericDocumentService, ValidationRules, UploadedDocument } from '@/services/document/genericDocumentService';
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
  const [retryCount, setRetryCount] = useState(0);
  
  const { files, handleFilesAdded: addFiles, removeFile, clearFiles } = useFileState();
  const { uploadProgress, startProgressSimulation, completeProgress, resetProgress } = useUploadProgress();
  const { ensureBucketExists, initializingBucket, bucketError } = useBucketManagement();
  
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
    
    // Determine which bucket to use
    const bucketName = isPersonal || documentType === 'standard' 
      ? 'company_documents_storage' 
      : documentType === 'value_chain' 
        ? 'value_chain_documents' 
        : documentType === 'deliverable'
          ? 'deliverables_storage'
          : 'company_documents_storage';
        
    // Check if bucket exists (or create it)
    const bucketExists = await ensureBucketExists(bucketName);
    
    if (!bucketExists) {
      if (retryCount < 2) {
        // Try again once more if it fails
        setRetryCount(prev => prev + 1);
        toast.warning("Storage initialization failed. Retrying...");
        setIsUploading(false);
        
        // Wait a bit before retrying
        setTimeout(() => {
          uploadFiles();
        }, 1500);
        
        return [];
      } else {
        setError('Failed to access storage. Please try again later or contact support.');
        setIsUploading(false);
        setRetryCount(0);
        return [];
      }
    }
    
    // Reset retry count on success
    setRetryCount(0);
    
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
      const effectiveEntityId = isPersonal ? user.id : companyId;
      
      console.log(`Uploading to bucket ${bucketName} with entity ID ${effectiveEntityId}`);
      
      const documents = await genericDocumentService.uploadDocuments(
        files,
        effectiveEntityId as string,
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
    resetProgress,
    retryCount
  ]);
  
  return {
    files,
    isUploading,
    initializingBucket,
    uploadProgress,
    error: error || (bucketError ? bucketError.message : null),
    handleFilesAdded,
    removeFile,
    clearFiles,
    uploadFiles
  };
}
