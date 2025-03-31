
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
      setIsAuthenticated(!!session);
      console.log("Auth state changed:", event, "Is authenticated:", !!session);
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

  // Only use hooks if authenticated - this ensures consistent hook execution order
  const activityTrackingData = useActivityTracking(isAdmin);
  const authTrackingData = useAuthTracking(isAdmin);
  const teamEngagementData = useTeamEngagement(isAdmin);

  // This component doesn't render anything visible
  return null;
}

export default EngagementTracker;
