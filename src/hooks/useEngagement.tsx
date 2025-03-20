
import { useCallback } from 'react';
import { engagementService, UserActivity } from '@/services/engagement';
import { useToast } from '@/components/ui/use-toast';

export const useEngagement = () => {
  const { toast } = useToast();

  const trackActivity = useCallback(async (activity: UserActivity, showReward = false) => {
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
      console.warn("Error in trackActivity:", error);
      // Return false but don't break the app flow
      return false;
    }
  }, [toast]);

  const formatActivityType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return {
    trackActivity
  };
};
