
import { useState, useCallback, useRef } from 'react';

export function useUploadProgress() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start simulating upload progress
   * @returns The progress interval handle
   */
  const startProgressSimulation = useCallback(() => {
    setUploadProgress(0);
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
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
    
    progressIntervalRef.current = progressInterval;
    return progressInterval;
  }, []);

  /**
   * Stop the progress simulation and set to 100%
   */
  const completeProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    setUploadProgress(100);
    
    // Reset after a delay
    setTimeout(() => {
      setUploadProgress(0);
    }, 1000);
  }, []);

  /**
   * Reset the progress and clear any interval
   */
  const resetProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    setUploadProgress(0);
  }, []);

  return {
    uploadProgress,
    startProgressSimulation,
    completeProgress,
    resetProgress
  };
}
