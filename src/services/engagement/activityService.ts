
import { supabase } from "@/lib/supabase";
import { UserActivity } from "./types";
import { badgeService } from "./badgeService";

/**
 * Service for tracking user activities and time spent
 */
class ActivityService {
  async trackActivity(activity: UserActivity): Promise<boolean> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Auth error when tracking activity:", userError);
        return false;
      }
      
      if (!userData?.user) {
        console.warn("No authenticated user found when tracking activity");
        return false;
      }

      console.log(`Tracking activity: ${activity.activity_type} for user ${userData.user.id}, points: ${activity.points_earned}`);

      // Get the user's profile to retrieve company_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') { // Not found is okay
        console.error("Error fetching profile for activity tracking:", profileError);
      }
      
      // Enhanced logging for debugging
      console.log("About to insert user activity with data:", {
        user_id: userData.user.id,
        activity_type: activity.activity_type,
        points_earned: activity.points_earned,
        company_id: profileData?.company_id || null
      });

      // Insert the activity with explicit user_id to satisfy RLS policies
      const { data: insertedActivity, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userData.user.id,
          activity_type: activity.activity_type,
          points_earned: activity.points_earned,
          metadata: activity.metadata || {},
          company_id: profileData?.company_id || null
        })
        .select();

      if (error) {
        // Log detailed error for debugging
        console.error("Database error tracking activity:", {
          errorCode: error.code,
          errorMessage: error.message,
          details: error.details,
          hint: error.hint,
          activity: activity
        });
        return false;
      }

      console.log(`Successfully tracked activity:`, insertedActivity);

      // Update activity count
      await this.incrementActivityCounter(userData.user.id);

      // Check for badges after successful activity tracking
      await badgeService.checkForBadges(userData.user.id);
      return true;
    } catch (error) {
      console.error("Exception tracking activity:", error);
      return false;
    }
  }

  async incrementActivityCounter(userId: string): Promise<void> {
    try {
      console.log(`Incrementing activity counter for user ${userId}`);
      
      // Try to insert a new record first
      const { data: insertData, error: insertError } = await supabase
        .from('user_engagement_stats')
        .insert({
          user_id: userId,
          activity_count: 1,
          total_points: 0,
          time_spent_seconds: 0,
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertData) {
        console.log("Successfully created new engagement stats record:", insertData);
        return;
      }
      
      // If user already exists, update their count instead
      if (insertError && insertError.code === '23505') { // Unique violation
        console.log("User stats already exist, incrementing count");
        
        // Query first to ensure the record exists
        const { data: checkData } = await supabase
          .from('user_engagement_stats')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (checkData) {
          // Update the existing record
          const { data: updateData, error: updateError } = await supabase
            .from('user_engagement_stats')
            .update({ 
              activity_count: checkData.activity_count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select();
            
          if (updateError) {
            console.error("Error updating activity counter:", updateError);
            return;
          }
          
          console.log("Activity counter incremented successfully:", updateData);
        } else {
          console.error("Could not find user stats record to update");
        }
      } else if (insertError) {
        console.error("Error inserting activity counter:", insertError);
        return;
      }
    } catch (error) {
      console.error("Error incrementing activity counter:", error);
    }
  }

  async trackTimeSpent(seconds: number): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      console.log(`Tracking time spent: ${seconds} seconds for user ${userData.user.id}`);

      // First check if the user has a stats entry
      const { data: checkData } = await supabase
        .from('user_engagement_stats')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
        
      if (!checkData) {
        // Create a new entry if none exists
        const { error: insertError } = await supabase
          .from('user_engagement_stats')
          .insert({
            user_id: userData.user.id,
            time_spent_seconds: seconds,
            last_active_at: new Date().toISOString(),
            activity_count: 0,
            total_points: 0
          });
          
        if (insertError) {
          console.warn("Error creating time spent record:", insertError.message);
          return false;
        }
        
        return true;
      }
      
      // Update existing entry
      const { error } = await supabase
        .from('user_engagement_stats')
        .update({ 
          time_spent_seconds: checkData.time_spent_seconds + seconds,
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
  
  async getUserActivityHistory(userId?: string, limit = 20, offset = 0): Promise<{ data: any[], count: number }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const targetUserId = userId || userData.user?.id;
      
      if (!targetUserId) {
        console.warn("No user ID provided for activity history");
        return { data: [], count: 0 };
      }
      
      console.log(`Fetching activity history for user ${targetUserId}, limit ${limit}, offset ${offset}`);
      
      // Get the count of activities for pagination
      const { count, error: countError } = await supabase
        .from('user_activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);
        
      if (countError) {
        console.warn("Error counting activity history:", countError);
        return { data: [], count: 0 };
      }

      // Get activities with pagination
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (error) {
        console.warn("Error fetching activity history:", error);
        return { data: [], count: 0 };
      }
      
      console.log(`Found ${count || 0} total activities, returning ${data?.length || 0} items`);
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.warn("Exception fetching activity history:", error);
      return { data: [], count: 0 };
    }
  }
}

export const activityService = new ActivityService();
