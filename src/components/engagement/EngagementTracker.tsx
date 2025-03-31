
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAuthTracking } from '@/hooks/useAuthTracking';
import { useTeamEngagement } from '@/hooks/useTeamEngagement';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export function EngagementTracker() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const location = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error in EngagementTracker:", error);
          return;
        }
        
        const isUserAuthenticated = !!data.session;
        setIsAuthenticated(isUserAuthenticated);
        
        if (!isUserAuthenticated) {
          console.log("User not authenticated, skipping engagement tracking");
        } else {
          console.log("User authenticated, enabling engagement tracking");
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error("Error checking authentication:", err);
        setIsInitialized(true); // Mark as initialized even on error
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      console.log("Auth state changed:", event, "Is authenticated:", authenticated);
      
      // If user just signed in, show welcome message
      if (event === 'SIGNED_IN' && authenticated) {
        toast({
          title: "Welcome back!",
          description: "Your engagement tracking is now active.",
          duration: 3000,
        });
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  // Check if user is on admin route
  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    setIsAdmin(isAdminRoute);
    
    console.log(`EngagementTracker: ${isAdminRoute ? 'Admin route detected' : 'User route detected'}. Path: ${location.pathname}`);
  }, [location.pathname]);

  // Initialize tracking hooks only after authentication check
  // Always call hooks unconditionally but control their behavior via props
  const activityTracking = useActivityTracking(isAdmin, isAuthenticated);
  const authTracking = useAuthTracking(isAdmin, isAuthenticated);
  const teamEngagement = useTeamEngagement(isAdmin, isAuthenticated);

  // Log that tracking is active (only if authenticated)
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      console.log("Engagement tracking active", { isAdmin, path: location.pathname });
    }
  }, [isAuthenticated, isAdmin, location.pathname, isInitialized]);

  // This component doesn't render anything visible
  return null;
}

export default EngagementTracker;
