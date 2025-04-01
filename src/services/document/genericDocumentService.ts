
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { storageBucketService } from './storage/storageBucketService';

export type DocumentType = 'standard' | 'personal' | 'value_chain' | 'deliverable';

export type UploadOptions = {
  folderId?: string | null;
  documentType?: DocumentType;
  isPersonal?: boolean;
  customPath?: string;
};

export type ValidationRules = {
  maxSize?: number;
  maxFiles?: number;
  allowedTypes?: string[];
};

export type UploadedDocument = {
  id: string;
  name: string;
  url: string;
  file_type?: string;
  file_size?: number;
};

export const genericDocumentService = {
  /**
   * Default validation rules for document uploads
   */
  defaultValidationRules: {
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 10,
    allowedTypes: [
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
  } as ValidationRules,
  
  /**
   * Validate files against a set of rules
   * @param files Files to validate
   * @param rules Validation rules to apply
   * @returns Object with valid and invalid files
   */
  validateFiles(files: File[], rules: ValidationRules = {}): { 
    validFiles: File[], 
    invalidFiles: { file: File, reason: string }[] 
  } {
    const activeRules = { ...this.defaultValidationRules, ...rules };
    const validFiles: File[] = [];
    const invalidFiles: { file: File, reason: string }[] = [];
    
    // Check total number of files
    if (activeRules.maxFiles && files.length > activeRules.maxFiles) {
      toast.error(`You can only upload up to ${activeRules.maxFiles} files at once`);
      
      // Still process the first maxFiles files
      files = files.slice(0, activeRules.maxFiles);
    }
    
    // Validate each file
    for (const file of files) {
      // Check file type
      if (activeRules.allowedTypes && activeRules.allowedTypes.length) {
        const fileType = file.type;
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        
        const isValidType = activeRules.allowedTypes.some(type => 
          fileType === type || 
          type.endsWith(`/${fileExt}`) || 
          type === `.${fileExt}` ||
          type === fileExt
        );
        
        if (!isValidType) {
          invalidFiles.push({
            file,
            reason: 'Invalid file type. Please upload documents in accepted formats.'
          });
          continue;
        }
      }
      
      // Check file size
      if (activeRules.maxSize && file.size > activeRules.maxSize) {
        invalidFiles.push({
          file,
          reason: `File too large. Maximum size is ${(activeRules.maxSize / (1024 * 1024)).toFixed(1)}MB.`
        });
        continue;
      }
      
      // If all checks pass, add to valid files
      validFiles.push(file);
    }
    
    return { validFiles, invalidFiles };
  },
  
  /**
   * Upload documents
   * @param files Files to upload
   * @param entityId Company or user ID for the owner of the documents
   * @param options Upload options
   * @param rules Validation rules
   * @returns Promise<UploadedDocument[]> Uploaded document information
   */
  async uploadDocuments(
    files: File[], 
    entityId: string,
    options: UploadOptions = {},
    rules: ValidationRules = {}
  ): Promise<UploadedDocument[]> {
    try {
      // First validate all files
      const { validFiles, invalidFiles } = this.validateFiles(files, rules);
      
      // Show errors for invalid files
      for (const { file, reason } of invalidFiles) {
        toast.error(`${file.name}: ${reason}`);
      }
      
      if (validFiles.length === 0) {
        return [];
      }
      
      // Ensure user is authenticated
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        toast.error('Authentication required to upload documents');
        throw new Error('User not authenticated');
      }
      
      // Determine bucket and base path based on document type
      let bucket: string;
      let basePath: string;
      
      if (options.isPersonal) {
        bucket = 'company_documents_storage';
        basePath = `personal/${entityId}`;
      } else if (options.documentType === 'value_chain') {
        bucket = 'value_chain_documents';
        basePath = entityId;
      } else {
        bucket = 'company_documents_storage';
        basePath = entityId;
      }
      
      // Add folder path if specified
      if (options.folderId) {
        basePath = `${basePath}/${options.folderId}`;
      }
      
      // Use custom path if specified
      if (options.customPath) {
        basePath = options.customPath;
      }
      
      // Ensure the storage bucket exists
      const bucketExists = await storageBucketService.ensureBucketExists(bucket);
      if (!bucketExists) {
        toast.error('Failed to access storage');
        throw new Error('Storage not available');
      }
      
      // Upload each valid file
      const uploadPromises = validFiles.map(async (file) => {
        // Create a safe file name with timestamp to prevent conflicts
        const filePath = `${basePath}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        // Upload file
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError);
          toast.error(`Failed to upload ${file.name}`);
          throw uploadError;
        }
        
        // Get file URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
          
        if (!urlData || !urlData.publicUrl) {
          throw new Error('Failed to get file URL');
        }
        
        // Save document record in database
        const docType = options.documentType || 'standard';
        
        const { data: docData, error: docError } = await supabase
          .from('company_documents')
          .insert({
            name: file.name,
            url: urlData.publicUrl,
            file_type: file.type,
            file_size: file.size,
            folder_id: options.folderId,
            company_id: entityId,
            uploaded_by: userData.user.id,
            document_type: docType
          })
          .select()
          .single();
          
        if (docError) {
          console.error(`Error saving document record for ${file.name}:`, docError);
          throw docError;
        }
        
        return {
          id: docData.id,
          name: docData.name,
          url: docData.url,
          file_type: docData.file_type,
          file_size: docData.file_size
        } as UploadedDocument;
      });
      
      // Wait for all uploads to complete
      const results = await Promise.allSettled(uploadPromises);
      
      // Process results
      const uploaded: UploadedDocument[] = [];
      let failedCount = 0;
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          uploaded.push(result.value);
        } else {
          failedCount++;
        }
      });
      
      // Show toast based on success/failure
      if (failedCount === 0 && uploaded.length > 0) {
        toast.success(`Successfully uploaded ${uploaded.length} document${uploaded.length > 1 ? 's' : ''}`);
      } else if (uploaded.length > 0) {
        toast.warning(`Uploaded ${uploaded.length} of ${validFiles.length} documents`);
      } else {
        toast.error('No documents were uploaded');
      }
      
      return uploaded;
    } catch (error) {
      console.error('Error in document upload:', error);
      toast.error('Document upload failed');
      throw error;
    }
  }
};
