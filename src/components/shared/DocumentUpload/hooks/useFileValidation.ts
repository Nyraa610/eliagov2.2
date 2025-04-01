
import { useState } from 'react';
import { toast } from 'sonner';

export type ValidationRule = {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types or extensions
  maxFiles?: number;
};

export function useFileValidation(rules: ValidationRule = {}) {
  const [invalidFiles, setInvalidFiles] = useState<{name: string, reason: string}[]>([]);
  
  const defaultRules: ValidationRule = {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif'
    ],
    maxFiles: 10
  };
  
  const activeRules = {
    ...defaultRules,
    ...rules
  };
  
  const validateFile = (file: File): boolean => {
    // Check file type
    if (activeRules.allowedTypes && activeRules.allowedTypes.length > 0) {
      const fileType = file.type;
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      const isTypeValid = activeRules.allowedTypes.some(type => {
        return fileType === type || 
               type.endsWith(`/${fileExt}`) || 
               type === `.${fileExt}` ||
               type === fileExt;
      });
      
      if (!isTypeValid) {
        setInvalidFiles(prev => [...prev, { 
          name: file.name, 
          reason: 'Invalid file type. Please upload documents in accepted formats.'
        }]);
        
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }
    }
    
    // Check file size
    if (activeRules.maxSize && file.size > activeRules.maxSize) {
      const maxSizeMB = Math.round(activeRules.maxSize / (1024 * 1024));
      
      setInvalidFiles(prev => [...prev, { 
        name: file.name, 
        reason: `File too large. Maximum size is ${maxSizeMB}MB.`
      }]);
      
      toast.error(`${file.name}: File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    
    return true;
  };
  
  const validateFiles = (files: File[]): File[] => {
    // Reset invalid files
    setInvalidFiles([]);
    
    // Check number of files
    if (activeRules.maxFiles && files.length > activeRules.maxFiles) {
      toast.error(`You can only upload up to ${activeRules.maxFiles} files at once`);
      return files.slice(0, activeRules.maxFiles);
    }
    
    // Filter valid files
    return files.filter(validateFile);
  };
  
  return {
    invalidFiles,
    validateFile,
    validateFiles
  };
}
