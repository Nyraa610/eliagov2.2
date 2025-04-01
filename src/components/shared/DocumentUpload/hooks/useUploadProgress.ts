
import { useState, useCallback } from 'react';

export function useUploadProgress() {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Progress simulation for when we don't have actual progress events
  const startProgressSimulation = useCallback(() => {
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prevProgress + Math.random() * 10;
      });
    }, 300);
    
    return interval;
  }, []);
  
  const completeProgress = useCallback(() => {
    setUploadProgress(100);
  }, []);
  
  const resetProgress = useCallback(() => {
    setUploadProgress(0);
  }, []);
  
  return {
    uploadProgress,
    setUploadProgress,
    startProgressSimulation,
    completeProgress,
    resetProgress
  };
}
