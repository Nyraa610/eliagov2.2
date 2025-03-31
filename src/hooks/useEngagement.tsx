
import { useCallback, useState, useEffect } from 'react';
import { engagementService, UserActivity } from '@/services/engagement';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

export const useEngagement = () => {
  const { toast, celebrateSuccess } = useToast();
  const location = useLocation();
  const { t } = useTranslation();
  const [teamActivities, setTeamActivities] = useState<any[]>([]);
  const [isTrackingTeam, setIsTrackingTeam] = useState<boolean>(false);

  // Skip tracking for admin routes to avoid permission issues
  const shouldSkipTracking = location.pathname.includes('/admin');

  const trackActivity = useCallback(async (activity: UserActivity, showReward = true) => {
    if (shouldSkipTracking) {
      console.log('Skipping activity tracking for admin route');
      return true;
    }

    try {
      // Check if user is authenticated first
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log("User not authenticated, skipping activity tracking");
        return true;
      }
      
      // Add timestamp to metadata
      const enhancedMetadata = {
        ...activity.metadata,
        timestamp: new Date().toISOString(),
        path: location.pathname,
      };
      
      const enhancedActivity = {
        ...activity,
        metadata: enhancedMetadata
      };
      
      console.log("Tracking activity:", enhancedActivity);
      
      const success = await engagementService.trackActivity(enhancedActivity);
      
      // Always show the toast notification for points earned if showReward is true
      if (success && showReward && activity.points_earned > 0) {
        toast({
          title: t("engagement.pointsEarned", "Points Earned!"),
          description: `+${activity.points_earned} ${t("engagement.points", "points")} - ${formatActivityType(activity.activity_type)}`,
          duration: 3000,
          variant: "success"
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error in trackActivity:", error);
      return false;
    }
  }, [toast, shouldSkipTracking, t, location.pathname]);

  // Helper to format activity types for display
  const formatActivityType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Start tracking team activities with realtime updates
  const startTeamTracking = useCallback(async () => {
    if (isTrackingTeam) return () => {};
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return () => {};
      
      // Get user's company ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single();
      
      if (!profileData || !profileData.company_id) return () => {};
      
      console.log("Starting team activity tracking for company:", profileData.company_id);
      
      // Subscribe to team activity changes
      const channel = supabase
        .channel('team-activities')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
          filter: `company_id=eq.${profileData.company_id}` 
        }, (payload) => {
          // Only add activities from other team members
          if (payload.new && payload.new.user_id !== userData.user.id) {
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
  }, [isTrackingTeam]);
  
  // Get team activities history
  const getTeamActivities = useCallback(async (limit = 20) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return [];
      
      // Get user's company ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single();
      
      if (!profileData || !profileData.company_id) return [];
      
      console.log("Getting team activities for company:", profileData.company_id);
      
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
        .eq('company_id', profileData.company_id)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      return data || [];
    } catch (error) {
      console.warn("Error getting team activities:", error);
      return [];
    }
  }, []);
  
  return {
    trackActivity,
    teamActivities,
    startTeamTracking,
    getTeamActivities
  };
};
