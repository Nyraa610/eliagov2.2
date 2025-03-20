
import { supabase } from "@/lib/supabase";
import { UserActivity } from "./types";
import { badgeService } from "./badgeService";

/**
 * Service for tracking user activities and time spent
 */
class ActivityService {
  async trackActivity(activity: UserActivity): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      // Check if user has permissions before attempting to insert
      const { data: testPerm, error: testError } = await supabase
        .from('user_activities')
        .select('id')
        .limit(1);
        
      if (testError) {
        console.warn("User may not have correct permissions for tracking activities:", testError.message);
        return false;
      }

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userData.user.id,
          activity_type: activity.activity_type,
          points_earned: activity.points_earned,
          metadata: activity.metadata || {}
        });

      if (error) {
        console.warn("Error tracking activity:", error.message);
        return false;
      }

      await badgeService.checkForBadges(userData.user.id);
      return true;
    } catch (error) {
      console.warn("Exception tracking activity:", error);
      return false;
    }
  }

  async trackTimeSpent(seconds: number): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('user_engagement_stats')
        .update({ 
          time_spent_seconds: supabase.rpc('increment', { x: seconds }),
          last_active_at: new Date().toISOString()
        })
        .eq('user_id', userData.user.id);

      if (error) {
        console.warn("Error tracking time spent:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Exception tracking time spent:", error);
      return false;
    }
  }
}

export const activityService = new ActivityService();
