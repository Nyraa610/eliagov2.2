
import { useState, useCallback } from 'react';

export function useFileState() {
  const [files, setFiles] = useState<File[]>([]);
  
  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);
  
  const removeFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);
  
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
