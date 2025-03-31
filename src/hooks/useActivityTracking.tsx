
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { engagementService } from '@/services/engagement';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export function useActivityTracking(isAdmin: boolean, isAuthenticated: boolean = true, userId: string | null = null) {
  const [lastActive, setLastActive] = useState<number>(Date.now());
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const location = useLocation();
  const { toast } = useToast();

  // Track page views - skip for admin routes or unauthenticated users
  useEffect(() => {
    if (isAdmin || !isAuthenticated || !userId) {
      console.log(`Skipping page view tracking: ${isAdmin ? 'Admin route' : !isAuthenticated ? 'Not authenticated' : 'No user ID'}`);
      return;
    }
    
    const trackPageView = async () => {
      try {
        // Double-check authentication
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.log("No valid session found, skipping page view tracking");
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
        
        console.log(`Tracking page view: ${location.pathname} as ${activityType} for ${pointsEarned} points for user ${sessionData.session.user.id}`);
        
        const success = await engagementService.trackActivity({
          activity_type: activityType,
          points_earned: pointsEarned,
          metadata: { 
            path: location.pathname,
            timestamp: new Date().toISOString(),
            automatic: true
          }
        });
        
        if (success) {
          console.log(`Successfully tracked page view: ${activityType}, +${pointsEarned} points`);
          // Show a toast notification for significant points
          if (pointsEarned > 1) {
            toast({
              title: "Points Earned",
              description: `+${pointsEarned} points for visiting ${location.pathname}`,
              variant: "default"
            });
          }
        } else {
          console.warn(`Failed to track page view: ${activityType}`);
        }
        
        setLastActive(Date.now());
      } catch (error) {
        console.error("Page view tracking error:", error);
      }
    };

    // Execute the tracking after a small delay to ensure auth is ready
    const trackingTimeout = setTimeout(() => {
      trackPageView();
    }, 500);

    return () => clearTimeout(trackingTimeout);
  }, [location.pathname, isAdmin, isAuthenticated, userId, toast]);

  // Track time spent - skip for admin routes or unauthenticated users
  useEffect(() => {
    if (isAdmin || !isAuthenticated || !userId) return;
    
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
  }, [lastActive, isTracking, isAdmin, isAuthenticated, userId]);

  // Track user interactions - skip for admin routes or unauthenticated users
  useEffect(() => {
    if (isAdmin || !isAuthenticated || !userId) return;
    
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
  }, [isAdmin, isAuthenticated, userId]);

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
