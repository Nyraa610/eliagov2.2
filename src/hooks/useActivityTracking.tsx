
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { engagementService } from '@/services/engagement';
import { supabase } from '@/lib/supabase';

export function useActivityTracking(isAdmin: boolean) {
  const [lastActive, setLastActive] = useState<number>(Date.now());
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const location = useLocation();

  // Track page views - skip for admin routes
  useEffect(() => {
    if (isAdmin) {
      console.log("Admin route detected, skipping page view tracking");
      return;
    }
    
    const trackPageView = async () => {
      try {
        // Check if user is authenticated first
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          console.log("User not authenticated, skipping activity tracking");
          return;
        }
        
        // Base points for any page view
        let pointsEarned = 1;
        let activityType = 'page_view';
        
        // Special case for specific page types
        if (location.pathname.includes('/assessment')) {
          activityType = 'view_assessment';
          pointsEarned = 3;
        } else if (location.pathname.includes('/training')) {
          activityType = 'view_training';
          pointsEarned = 2;
        } else if (location.pathname.includes('/value-chain')) {
          activityType = 'view_value_chain';
          pointsEarned = 3;
        } else if (location.pathname === '/engagement') {
          activityType = 'visit_engagement_page';
          pointsEarned = 3;
        } else if (location.pathname === '/') {
          activityType = 'view_dashboard';
          pointsEarned = 2;
        }
        
        console.log(`Tracking page view: ${location.pathname} as ${activityType} for ${pointsEarned} points`);
        
        const success = await engagementService.trackActivity({
          activity_type: activityType,
          points_earned: pointsEarned,
          metadata: { 
            path: location.pathname,
            timestamp: new Date().toISOString() 
          }
        });
        
        if (success) {
          console.log(`Successfully tracked page view: ${activityType}, +${pointsEarned} points`);
        } else {
          console.warn(`Failed to track page view: ${activityType}`);
        }
        
        setLastActive(Date.now());
      } catch (error) {
        console.error("Page view tracking error:", error);
      }
    };

    // Small delay to ensure auth is checked properly
    const trackingTimeout = setTimeout(() => {
      trackPageView();
    }, 500);

    return () => clearTimeout(trackingTimeout);
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
        
        console.log(`Tracking time spent: ${cappedTime} seconds`);
        
        engagementService.trackTimeSpent(cappedTime).catch(err => {
          console.warn("Could not track time spent", err);
        });
        
        // Track significant time milestones (e.g., every 30 minutes)
        if (timeSpentSeconds >= 1800) { // 30 minutes
          console.log("Tracking significant time milestone");
          
          engagementService.trackActivity({
            activity_type: 'significant_time_spent',
            points_earned: 3,
            metadata: {
              seconds: timeSpentSeconds,
              minutes: Math.floor(timeSpentSeconds / 60),
              timestamp: new Date().toISOString()
            }
          }).catch(err => {
            console.warn("Could not track time milestone", err);
          });
        }
        
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

  return {
    lastActive,
    isTracking,
    setLastActive,
    setIsTracking
  };
}
