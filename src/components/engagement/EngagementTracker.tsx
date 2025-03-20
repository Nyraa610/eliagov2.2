
import { useEffect, useState } from 'react';
import { engagementService } from '@/services/engagement';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function EngagementTracker() {
  const [lastActive, setLastActive] = useState<number>(Date.now());
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is on admin route
  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    setIsAdmin(isAdminRoute);
  }, [location.pathname]);

  // Track user login - skip for admin routes
  useEffect(() => {
    if (isAdmin) return;
    
    const checkUserAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          // Record login activity
          await engagementService.trackActivity({
            activity_type: 'login',
            points_earned: 5
          }).catch(err => {
            console.warn("Could not track login activity", err);
          });
        }
      } catch (error) {
        console.warn("Auth check error in EngagementTracker:", error);
      }
    };

    checkUserAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && !isAdmin) {
          try {
            await engagementService.trackActivity({
              activity_type: 'login',
              points_earned: 5
            }).catch(err => {
              console.warn("Could not track login activity on auth change", err);
            });
          } catch (error) {
            console.warn("Auth change error in EngagementTracker:", error);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isAdmin]);

  // Track page views - skip for admin routes
  useEffect(() => {
    if (isAdmin) return;
    
    const trackPageView = async () => {
      try {
        await engagementService.trackActivity({
          activity_type: 'page_view',
          points_earned: 1,
          metadata: { path: location.pathname }
        }).catch(err => {
          console.warn("Could not track page view", err);
        });
        setLastActive(Date.now());
      } catch (error) {
        console.warn("Page view tracking error:", error);
      }
    };

    trackPageView();
  }, [location.pathname, isAdmin]);

  // Track time spent - skip for admin routes
  useEffect(() => {
    if (isAdmin) return;
    
    const trackInterval = setInterval(() => {
      if (!isTracking) return;

      const now = Date.now();
      const timeSpentSeconds = Math.floor((now - lastActive) / 1000);
      
      if (timeSpentSeconds > 5) {
        // Cap inactive time at 60 seconds to prevent large time accumulations during breaks
        const cappedTime = Math.min(timeSpentSeconds, 60);
        engagementService.trackTimeSpent(cappedTime).catch(err => {
          console.warn("Could not track time spent", err);
        });
        setLastActive(now);
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(trackInterval);
    };
  }, [lastActive, isTracking, isAdmin]);

  // Track user interactions - skip for admin routes
  useEffect(() => {
    if (isAdmin) return;
    
    const handleUserActivity = () => {
      setLastActive(Date.now());
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [isAdmin]);

  // Pause tracking when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTracking(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

export default EngagementTracker;
