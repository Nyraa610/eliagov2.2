
import { useEffect, useState } from 'react';
import { engagementService } from '@/services/engagement';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function EngagementTracker() {
  const [lastActive, setLastActive] = useState<number>(Date.now());
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Track user login
  useEffect(() => {
    const checkUserAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Record login activity
        await engagementService.trackActivity({
          activity_type: 'login',
          points_earned: 5
        });
      }
    };

    checkUserAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          await engagementService.trackActivity({
            activity_type: 'login',
            points_earned: 5
          });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Track page views
  useEffect(() => {
    const trackPageView = async () => {
      await engagementService.trackActivity({
        activity_type: 'page_view',
        points_earned: 1,
        metadata: { path: location.pathname }
      });
      setLastActive(Date.now());
    };

    trackPageView();
  }, [location.pathname]);

  // Track time spent
  useEffect(() => {
    const trackInterval = setInterval(() => {
      if (!isTracking) return;

      const now = Date.now();
      const timeSpentSeconds = Math.floor((now - lastActive) / 1000);
      
      if (timeSpentSeconds > 5) {
        // Cap inactive time at 60 seconds to prevent large time accumulations during breaks
        const cappedTime = Math.min(timeSpentSeconds, 60);
        engagementService.trackTimeSpent(cappedTime);
        setLastActive(now);
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(trackInterval);
    };
  }, [lastActive, isTracking]);

  // Track user interactions
  useEffect(() => {
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
  }, []);

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
