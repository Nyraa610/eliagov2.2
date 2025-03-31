
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAuthTracking } from '@/hooks/useAuthTracking';
import { useTeamEngagement } from '@/hooks/useTeamEngagement';
import { supabase } from '@/lib/supabase';

export function EngagementTracker() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const isUserAuthenticated = !!data.session;
      setIsAuthenticated(isUserAuthenticated);
      
      if (!isUserAuthenticated) {
        console.log("User not authenticated, skipping engagement tracking");
      } else {
        console.log("User authenticated, enabling engagement tracking");
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      console.log("Auth state changed:", event, "Is authenticated:", authenticated);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check if user is on admin route
  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    setIsAdmin(isAdminRoute);
    
    console.log(`EngagementTracker: ${isAdminRoute ? 'Admin route detected' : 'User route detected'}. Path: ${location.pathname}`);
  }, [location.pathname]);

  // Initialize tracking hooks - IMPORTANT: Always call hooks unconditionally
  // But we'll control their behavior based on authentication status inside them
  const activityTracking = useActivityTracking(isAdmin, isAuthenticated);
  const authTracking = useAuthTracking(isAdmin, isAuthenticated);
  const teamEngagement = useTeamEngagement(isAdmin, isAuthenticated);

  // Log that tracking is active (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Engagement tracking active", { isAdmin, path: location.pathname });
    }
  }, [isAuthenticated, isAdmin, location.pathname]);

  // This component doesn't render anything visible
  return null;
}

export default EngagementTracker;
