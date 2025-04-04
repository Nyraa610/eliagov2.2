
import { useCallback, useState, useEffect, useRef } from 'react';
import { engagementService, UserActivity } from '@/services/engagement';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export const useEngagement = () => {
  const { toast } = useToast();
  const location = useLocation();
  const { t } = useTranslation();
  const [teamActivities, setTeamActivities] = useState<any[]>([]);
  const [isTrackingTeam, setIsTrackingTeam] = useState<boolean>(false);
  const { user, companyId } = useAuth(); // Use cached auth data
  const trackingSet = useRef(new Set<string>()); // Track already-recorded activities

  // Skip tracking for admin routes to avoid permission issues
  const shouldSkipTracking = location.pathname.includes('/admin');

  const trackActivity = useCallback(async (activity: UserActivity, showReward = true) => {
    if (shouldSkipTracking) {
      console.log('Skipping activity tracking for admin route');
      return true;
    }

    if (!user) {
      console.log("User not authenticated, skipping activity tracking");
      return false;
    }
    
    try {
      // Create a tracking key to prevent duplicate activities
      const activityKey = `${activity.activity_type}-${JSON.stringify(activity.metadata || {})}-${new Date().getTime()}`;
      
      // Skip if we've already tracked this exact activity in this session
      if (trackingSet.current.has(activityKey)) {
        console.log("Skipping duplicate activity", activity.activity_type);
        return true;
      }
      
      // Add timestamp and user info to metadata
      const enhancedMetadata = {
        ...activity.metadata,
        timestamp: new Date().toISOString(),
        path: location.pathname,
        tracked_user_id: user.id
      };
      
      const enhancedActivity = {
        ...activity,
        metadata: enhancedMetadata
      };
      
      console.log("Tracking activity:", enhancedActivity);
      
      const success = await engagementService.trackActivity(enhancedActivity);
      
      // Record that we tracked this activity
      if (success) {
        trackingSet.current.add(activityKey);
        
        // Show toast notification for points earned if requested
        if (showReward && activity.points_earned > 0) {
          toast({
            title: t("engagement.pointsEarned", "Points Earned!"),
            description: `+${activity.points_earned} ${t("engagement.points", "points")} - ${formatActivityType(activity.activity_type)}`,
            duration: 3000,
            variant: "success"
          });
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error in trackActivity:", error);
      return false;
    }
  }, [toast, shouldSkipTracking, t, location.pathname, user]);

  // Helper to format activity types for display
  const formatActivityType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Start tracking team activities with realtime updates
  const startTeamTracking = useCallback(async () => {
    if (isTrackingTeam || !companyId) return () => {};
    
    try {
      console.log("Starting team activity tracking for company:", companyId);
      
      // Subscribe to team activity changes
      const channel = supabase
        .channel('team-activities')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
          filter: `company_id=eq.${companyId}` 
        }, (payload) => {
          // Only add activities from other team members
          if (payload.new && payload.new.user_id !== user?.id) {
            setTeamActivities((prev) => [payload.new, ...prev]);
          }
        })
        .subscribe();

      setIsTrackingTeam(true);
      
      return () => {
        supabase.removeChannel(channel);
        setIsTrackingTeam(false);
      };
    } catch (error) {
      console.warn("Error tracking team activities:", error);
      return () => {};
    }
  }, [isTrackingTeam, companyId, user]);
  
  // Get team activities history
  const getTeamActivities = useCallback(async (limit = 20) => {
    if (!companyId) return [];
    
    try {
      const { data } = await supabase
        .from('user_activities')
        .select(`
          id, 
          user_id, 
          activity_type, 
          points_earned, 
          metadata,
          created_at,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      return data || [];
    } catch (error) {
      console.warn("Error getting team activities:", error);
      return [];
    }
  }, [companyId]);
  
  return {
    trackActivity,
    teamActivities,
    startTeamTracking,
    getTeamActivities,
    userId: user?.id
  };
};
