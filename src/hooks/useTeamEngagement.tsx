
import { useState, useEffect, useRef } from 'react';
import { useEngagement } from '@/hooks/useEngagement';

interface TeamEngagementConfig {
  isAdmin?: boolean;
  isAuthenticated?: boolean;
  userId?: string | null;
  companyId?: string | null;
}

export function useTeamEngagement(config: TeamEngagementConfig = {}) {
  const { isAdmin = false, isAuthenticated = true, companyId } = config;
  const [teamTracking, setTeamTracking] = useState<boolean>(false);
  const { startTeamTracking } = useEngagement();
  const initAttempted = useRef(false);

  // Initialize team activity tracking only once
  useEffect(() => {
    if (isAdmin || !isAuthenticated || teamTracking || initAttempted.current || !companyId) {
      return;
    }
    
    initAttempted.current = true;
    
    const initTeamTracking = async () => {
      console.log("Initializing team tracking once for company:", companyId);
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
  }, [isAdmin, isAuthenticated, startTeamTracking, teamTracking, companyId]);

  return {
    teamTracking,
    setTeamTracking
  };
}
