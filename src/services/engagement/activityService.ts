
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

      // Get user's company ID for team activity tracking
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single();
      
      const companyId = profileData?.company_id;

      // Check if user has permissions before attempting to insert
      const { data: testPerm, error: testError } = await supabase
        .from('user_activities')
        .select('id')
        .limit(1);
        
      if (testError) {
        console.warn("User may not have correct permissions for tracking activities:", testError.message);
        // Return true to prevent errors from cascading through the app
        // This is non-critical functionality
        return true;
      }

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userData.user.id,
          company_id: companyId, // Add company ID for team tracking
          activity_type: activity.activity_type,
          points_earned: activity.points_earned,
          metadata: activity.metadata || {}
        });

      if (error) {
        console.warn("Error tracking activity:", error.message);
        // Return true to prevent errors from cascading through the app
        return true;
      }

      // Update activity count separately
      await this.incrementActivityCounter(userData.user.id);

      await badgeService.checkForBadges(userData.user.id);
      return true;
    } catch (error) {
      console.warn("Exception tracking activity:", error);
      // Return true to prevent errors from cascading through the app
      return true;
    }
  }

  async incrementActivityCounter(userId: string): Promise<void> {
    try {
      // Increment activity counter directly in the stats table
      await supabase.rpc('increment_activity_counter', {
        user_id_param: userId
      }).throwOnError();
    } catch (error) {
      console.warn("Error incrementing activity counter:", error);
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
        // Return true to prevent errors from cascading through the app
        return true;
      }

      return true;
    } catch (error) {
      console.warn("Exception tracking time spent:", error);
      // Return true to prevent errors from cascading through the app
      return true;
    }
  }
  
  async getUserActivityHistory(userId: string, limit = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.warn("Error fetching activity history:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn("Exception fetching activity history:", error);
      return [];
    }
  }
}

export const activityService = new ActivityService();
