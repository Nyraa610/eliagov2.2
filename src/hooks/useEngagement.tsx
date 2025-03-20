
import { useCallback } from 'react';
import { engagementService, UserActivity } from '@/services/engagement';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';

export const useEngagement = () => {
  const { toast } = useToast();
  const location = useLocation();

  // Skip tracking for admin routes to avoid permission issues
  const shouldSkipTracking = location.pathname.includes('/admin');

  const trackActivity = useCallback(async (activity: UserActivity, showReward = false) => {
    if (shouldSkipTracking) {
      console.log('Skipping activity tracking for admin route');
      return true;
    }

    try {
      const success = await engagementService.trackActivity(activity);
      
      if (success && showReward) {
        toast({
          title: "Points Earned!",
          description: `You earned ${activity.points_earned} points for ${formatActivityType(activity.activity_type)}`,
          duration: 3000,
        });
      }
      
      return success;
    } catch (error) {
      console.warn("Error in trackActivity (non-critical):", error);
      // Return true to prevent errors from cascading through the app
      return true;
    }
  }, [toast, shouldSkipTracking]);

  const formatActivityType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return {
    trackActivity
  };
};
