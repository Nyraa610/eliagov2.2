
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAuthTracking } from '@/hooks/useAuthTracking';
import { useTeamEngagement } from '@/hooks/useTeamEngagement';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { timeTrackingService } from '@/services/engagement/timeTrackingService';

export function EngagementTracker() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error in EngagementTracker:", error);
          setIsInitialized(true);
          return;
        }
        
        const isUserAuthenticated = !!data.session;
        setIsAuthenticated(isUserAuthenticated);
        
        if (!isUserAuthenticated) {
          console.log("User not authenticated, skipping engagement tracking");
          setIsInitialized(true);
        } else {
          console.log("User authenticated, enabling engagement tracking with ID:", data.session.user.id);
          setUserId(data.session.user.id);
          setIsInitialized(true);
        }
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
      setUserId(session?.user?.id || null);
      console.log("Auth state changed:", event, "Is authenticated:", authenticated, "User ID:", session?.user?.id);
      
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
  // Pass the tracking configuration object to each hook
  const activityTracking = useActivityTracking({ isAdmin, isAuthenticated, userId });
  const authTracking = useAuthTracking({ isAdmin, isAuthenticated });
  const teamEngagement = useTeamEngagement({ isAdmin, isAuthenticated, userId });

  // Log that tracking is active (only if authenticated)
  useEffect(() => {
    if (isAuthenticated && isInitialized && userId) {
      console.log("Engagement tracking active", { isAdmin, userId, path: location.pathname });
    }
  }, [isAuthenticated, isAdmin, location.pathname, isInitialized, userId]);

  // Handle time tracking submission on page unload and interval
  useEffect(() => {
    // Only set up handlers if authenticated and not admin
    if (isAuthenticated && !isAdmin && userId) {
      console.log("Setting up time tracking for authenticated user:", userId);
      
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
  }, [isAuthenticated, isAdmin, userId]);

  // This component doesn't render anything visible
  return null;
}

export default EngagementTracker;
