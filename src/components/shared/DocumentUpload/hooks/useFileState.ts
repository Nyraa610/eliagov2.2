
import { useState, useCallback } from 'react';

export function useFileState() {
  const [files, setFiles] = useState<File[]>([]);
  
  /**
   * Process added files
   * @param newFiles Files to add
   */
  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);
  
  /**
   * Remove a file
   * @param index Index of the file to remove
   */
  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    handleFilesAdded,
    removeFile,
    clearFiles
  };
}
