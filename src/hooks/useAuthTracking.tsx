
import { useEffect, useRef } from 'react';
import { engagementService } from '@/services/engagement';
import { useAuth } from '@/contexts/AuthContext';

interface AuthTrackingConfig {
  isAdmin?: boolean;
  isAuthenticated?: boolean;
  userId?: string | null;
}

export function useAuthTracking(config: AuthTrackingConfig = {}) {
  const { isAdmin = false } = config;
  const { isAuthenticated, user } = useAuth();
  const hasTrackedLogin = useRef(false);
  
  // Track user login - skip for admin routes or if not authenticated
  useEffect(() => {
    if (isAdmin || !isAuthenticated || !user || hasTrackedLogin.current) return;
    
    const trackLoginActivity = async () => {
      try {
        console.log("Tracking login activity");
        hasTrackedLogin.current = true;
        
        // Record login activity - only once per session
        await engagementService.trackActivity({
          activity_type: 'login',
          points_earned: 5,
          metadata: {
            event: 'session_start',
            timestamp: new Date().toISOString()
          }
        }).catch(err => {
          console.warn("Could not track login activity", err);
          hasTrackedLogin.current = false; // Allow retry on next render
        });
      } catch (error) {
        console.warn("Auth tracking error:", error);
        hasTrackedLogin.current = false; // Allow retry on next render
      }
    };

    trackLoginActivity();
    
    // No need to set up auth state listeners here - we're already using the centralized auth context
  }, [isAdmin, isAuthenticated, user]);
}
