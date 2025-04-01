
import { useState, useCallback } from 'react';
import { genericDocumentService, ValidationRules, UploadedDocument } from '@/services/document/genericDocumentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

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
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Process added files
  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const rules = validationRules || genericDocumentService.defaultValidationRules;
    const { validFiles, invalidFiles } = genericDocumentService.validateFiles(newFiles, rules);
    
    invalidFiles.forEach(({ file, reason }) => {
      toast.error(`${file.name}: ${reason}`);
    });
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setError(null);
    }
  }, [validationRules]);
  
  // Remove a file
  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);
  
  // Ensure the storage bucket exists
  const ensureBucketExists = useCallback(async (bucketName: string) => {
    try {
      // First check if bucket exists
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error checking buckets:', error);
        return false;
      }
      
      // Check if our bucket exists in the list
      if (!data.find(bucket => bucket.name === bucketName)) {
        console.log('Bucket not found, attempting to create it');
        
        // Create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          return false;
        }
        
        console.log(`Created bucket ${bucketName} successfully`);
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
      
      return true;
    } catch (err) {
      console.error('Error ensuring bucket exists:', err);
      return false;
    }
  }, []);
  
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
    setUploadProgress(0);
    setError(null);
    
    // Check if bucket exists (or create it)
    const bucketName = 'company_documents_storage';
    const bucketExists = await ensureBucketExists(bucketName);
    
    if (!bucketExists) {
      setError('Failed to access storage. Please try again later.');
      setIsUploading(false);
      return [];
    }
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 5;
      });
    }, 200);
    
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
      setUploadProgress(100);
      
      // Clear files after successful upload
      setTimeout(() => {
        clearFiles();
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
      
      // Call the completion callback if provided
      if (onUploadComplete && documents.length > 0) {
        onUploadComplete(documents);
      }
      
      return documents;
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setUploadProgress(0);
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
    ensureBucketExists
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
