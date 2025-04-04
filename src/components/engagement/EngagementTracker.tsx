
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAuthTracking } from '@/hooks/useAuthTracking';
import { useTeamEngagement } from '@/hooks/useTeamEngagement';
import { timeTrackingService } from '@/services/engagement/timeTrackingService';
import { useAuth } from '@/contexts/AuthContext';

export function EngagementTracker() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const location = useLocation();
  const hasInitialized = useRef(false);
  const { isAuthenticated, user, companyId } = useAuth(); // Use cached auth data

  // Check if user is on admin route
  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    setIsAdmin(isAdminRoute);
    
    if (!hasInitialized.current && isAuthenticated) {
      console.log(`EngagementTracker: ${isAdminRoute ? 'Admin route' : 'User route'} detected. Path: ${location.pathname}`);
      hasInitialized.current = true;
    }
  }, [location.pathname, isAuthenticated]);

  // Initialize tracking hooks only after authentication check and once
  // Pass the tracking configuration object to each hook
  const activityTracking = useActivityTracking({ 
    isAdmin, 
    isAuthenticated, 
    userId: user?.id || null 
  });
  
  const authTracking = useAuthTracking({ 
    isAdmin, 
    isAuthenticated 
  });
  
  const teamEngagement = useTeamEngagement({ 
    isAdmin, 
    isAuthenticated, 
    userId: user?.id || null,
    companyId 
  });

  // Log that tracking is active (only if authenticated and only once)
  useEffect(() => {
    if (isAuthenticated && !isInitialized && user?.id) {
      console.log("Engagement tracking active", { isAdmin, userId: user.id, path: location.pathname });
      setIsInitialized(true);
    }
  }, [isAuthenticated, isAdmin, location.pathname, isInitialized, user]);

  // Handle time tracking submission on page unload and interval
  useEffect(() => {
    // Only set up handlers if authenticated and not admin
    if (isAuthenticated && !isAdmin && user?.id) {
      const handleBeforeUnload = () => {
        timeTrackingService.submitTime();
      };
      
      // Set up event listener for page unload
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        timeTrackingService.submitTime();
      };
    }
  }, [isAuthenticated, isAdmin, user]);

  // This component doesn't render anything visible
  return null;
}

export default EngagementTracker;
