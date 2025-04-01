
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { companyFolderService } from "./companyFolderService";

/**
 * Document types that can be stored in the system
 */
export type DocumentType = 'standard' | 'personal' | 'value_chain' | 'deliverable';

/**
 * Upload configuration options
 */
export interface UploadOptions {
  folderId?: string | null;
  documentType?: DocumentType;
  isPersonal?: boolean;
  customPath?: string;
}

/**
 * File validation rules
 */
export interface ValidationRules {
  maxSize?: number;  // In bytes
  allowedTypes?: string[];
  maxFiles?: number;
}

/**
 * Uploaded document metadata
 */
export interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

/**
 * Generic document service for handling file operations
 */
export const genericDocumentService = {
  /**
   * Default validation rules
   */
  defaultValidationRules: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif'
    ],
    maxFiles: 10
  },

  /**
   * Validate a file against the rules
   */
  validateFile(file: File, rules: ValidationRules = this.defaultValidationRules): { valid: boolean; message?: string } {
    // Check file size
    if (rules.maxSize && file.size > rules.maxSize) {
      const maxSizeMB = Math.round(rules.maxSize / (1024 * 1024));
      return { valid: false, message: `File size exceeds maximum limit of ${maxSizeMB}MB` };
    }

    // Check file type
    if (rules.allowedTypes && rules.allowedTypes.length > 0 && !rules.allowedTypes.includes(file.type)) {
      return { valid: false, message: `File type ${file.type} is not supported` };
    }

    return { valid: true };
  },

  /**
   * Validate an array of files
   */
  validateFiles(files: File[], rules: ValidationRules = this.defaultValidationRules): { 
    validFiles: File[]; 
    invalidFiles: { file: File; reason: string }[] 
  } {
    const validFiles: File[] = [];
    const invalidFiles: { file: File; reason: string }[] = [];

    // Check if too many files
    if (rules.maxFiles && files.length > rules.maxFiles) {
      files.slice(rules.maxFiles).forEach(file => {
        invalidFiles.push({ file, reason: `Maximum number of files (${rules.maxFiles}) exceeded` });
      });
      files = files.slice(0, rules.maxFiles);
    }

    // Validate each file
    files.forEach(file => {
      const validation = this.validateFile(file, rules);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, reason: validation.message || 'Unknown validation error' });
      }
    });

    return { validFiles, invalidFiles };
  },

  /**
   * Ensure bucket exists
   */
  async ensureBucketExists(bucketName: string): Promise<boolean> {
    try {
      console.log(`Checking if bucket ${bucketName} exists...`);
      
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return false;
      }
      
      const bucketExists = buckets?.some(b => b.name === bucketName);
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} not found, creating it...`);
        
        // Create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          return false;
        }
        
        console.log(`Bucket ${bucketName} created successfully`);
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      return false;
    }
  },

  /**
   * Upload documents
   */
  async uploadDocuments(
    files: File[], 
    companyId: string, 
    options: UploadOptions = {},
    rules: ValidationRules = this.defaultValidationRules
  ): Promise<UploadedDocument[]> {
    try {
      console.log('Starting document upload process...');
      
      // Validate authentication
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Authentication error:', authError);
        throw new Error('User not authenticated');
      }
      
      // Validate files
      const { validFiles, invalidFiles } = this.validateFiles(files, rules);
      
      if (invalidFiles.length > 0) {
        invalidFiles.forEach(({ file, reason }) => {
          toast.error(`${file.name}: ${reason}`);
        });
        
        if (validFiles.length === 0) {
          throw new Error('No valid files to upload');
        }
      }

      // Determine bucket name
      const bucketName = 'company_documents_storage';
      
      // Ensure bucket exists
      const bucketExists = await this.ensureBucketExists(bucketName);
      if (!bucketExists) {
        throw new Error('Failed to create or access storage bucket');
      }
      
      // Ensure company folder exists
      if (options.isPersonal) {
        // For personal documents, ensure the personal folder exists
        await companyFolderService.initializeCompanyFolder(authData.user.id);
      } else {
        // For company documents, initialize the company folder
        await companyFolderService.initializeCompanyFolder(companyId);
      }
      
      console.log('Bucket and folders verified, starting file uploads...');
      
      // Upload all files
      const uploadedDocuments: UploadedDocument[] = [];
      
      for (const file of validFiles) {
        try {
          // Create a secure file path with sanitized filename
          const basePath = options.isPersonal 
            ? `personal/${authData.user.id}` 
            : companyId;
          
          const customPathPrefix = options.customPath 
            ? `${options.customPath}/` 
            : '';
            
          const filePath = `${basePath}/${customPathPrefix}${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
          console.log(`Uploading ${file.name} to path: ${filePath}`);
          
          // Upload file
          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            console.error(`Error uploading ${file.name}:`, uploadError);
            toast.error(`Error uploading ${file.name}`);
            continue;
          }
          
          // Get file URL
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
            
          if (!urlData) {
            console.error(`Failed to get URL for ${file.name}`);
            toast.error(`Failed to get URL for ${file.name}`);
            continue;
          }
          
          console.log(`File uploaded successfully, got URL: ${urlData.publicUrl}`);
          
          // Create document record in database
          const { data, error: dbError } = await supabase
            .from('company_documents')
            .insert({
              name: file.name,
              url: urlData.publicUrl,
              file_type: file.type,
              file_size: file.size,
              folder_id: options.folderId || null,
              company_id: options.isPersonal ? null : companyId,
              uploaded_by: authData.user.id,
              document_type: options.documentType || 'standard',
              is_personal: options.isPersonal || false
            })
            .select()
            .single();
            
          if (dbError) {
            console.error(`Error creating document record for ${file.name}:`, dbError);
            toast.error(`Error saving document information for ${file.name}`);
            continue;
          }
          
          // Add to results
          uploadedDocuments.push({
            id: data.id,
            name: data.name,
            url: data.url,
            fileType: data.file_type,
            fileSize: data.file_size,
            createdAt: data.created_at
          });
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}`);
        }
      }
      
      // Report results
      if (uploadedDocuments.length === 0) {
        toast.error('No documents were uploaded successfully');
      } else if (uploadedDocuments.length < validFiles.length) {
        toast.warning(`Uploaded ${uploadedDocuments.length} of ${validFiles.length} documents`);
      } else {
        toast.success(`Successfully uploaded ${uploadedDocuments.length} document${uploadedDocuments.length > 1 ? 's' : ''}`);
      }
      
      return uploadedDocuments;
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    }
  },
  
  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Verify authentication
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user.user) {
        throw new Error('User not authenticated');
      }
      
      // Get document info
      const { data: document, error: fetchError } = await supabase
        .from('company_documents')
        .select('*')
        .eq('id', documentId)
        .single();
        
      if (fetchError || !document) {
        console.error('Error fetching document:', fetchError);
        throw new Error('Document not found');
      }
      
      // Check permissions - user can delete if they uploaded it or if they belong to the company
      let canDelete = document.uploaded_by === user.user.id;
      
      if (!canDelete && document.company_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.user.id)
          .single();
          
        canDelete = profile?.company_id === document.company_id;
      }
      
      if (!canDelete) {
        throw new Error('You do not have permission to delete this document');
      }
      
      // Delete document from storage if we have URL
      if (document.url) {
        try {
          // Extract path from URL
          const url = new URL(document.url);
          const pathParts = url.pathname.split('/');
          const bucketName = 'company_documents_storage';
          
          // Path is everything after the bucket name in the URL
          const filePath = pathParts.slice(2).join('/');
          
          if (filePath) {
            // Delete from storage
            await supabase.storage
              .from(bucketName)
              .remove([filePath]);
          }
        } catch (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue to delete DB record even if storage deletion fails
        }
      }
      
      // Delete document from database
      const { error: deleteError } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', documentId);
        
      if (deleteError) {
        console.error('Error deleting document record:', deleteError);
        throw new Error('Failed to delete document record');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      return false;
    }
  }
};
