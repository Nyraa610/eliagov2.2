
import { supabase } from "@/lib/supabase";
import { authService } from "../base/authService";
import { UserEngagementStats } from "./types";

/**
 * Service for managing user engagement statistics
 */
class StatsService {
  async getUserStats(userId?: string): Promise<UserEngagementStats | null> {
    try {
      const targetId = userId || (await authService.getCurrentUser())?.id;
      if (!targetId) return null;

      const { data, error } = await supabase
        .from('user_engagement_stats')
        .select('*')
        .eq('user_id', targetId)
        .single();

      if (error) {
        console.error("Error fetching user stats:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Exception fetching user stats:", error);
      return null;
    }
  }
}

export const statsService = new StatsService();
