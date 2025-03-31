
import { useState, useEffect } from 'react';
import { useEngagement } from '@/hooks/useEngagement';

export function useTeamEngagement(isAdmin: boolean, isAuthenticated: boolean = true) {
  const [teamTracking, setTeamTracking] = useState<boolean>(false);
  const { startTeamTracking } = useEngagement();

  // Initialize team activity tracking
  useEffect(() => {
    if (isAdmin || !isAuthenticated || teamTracking) {
      return;
    }
    
    const initTeamTracking = async () => {
      const cleanup = await startTeamTracking();
      if (cleanup) {
        setTeamTracking(true);
        return cleanup;
      }
      return undefined;
    };
    
    let cleanupFn: (() => void) | undefined;
    
    initTeamTracking()
      .then(cleanup => {
        cleanupFn = cleanup;
      })
      .catch(error => {
        console.warn("Error initializing team tracking:", error);
      });
    
    return () => {
      if (cleanupFn) {
        cleanupFn();
        setTeamTracking(false);
      }
    };
  }, [isAdmin, isAuthenticated, startTeamTracking, teamTracking]);

  return {
    teamTracking,
    setTeamTracking
  };
}
