
import { supabase } from "@/lib/supabase";
import { Badge, UserBadge } from "./types";
import { statsService } from "./statsService";

/**
 * Service for managing badges
 */
class BadgeService {
  async getUserBadges(userId?: string): Promise<UserBadge[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const targetId = userId || userData.user?.id;
      if (!targetId) return [];

      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', targetId);

      if (error) {
        console.error("Error fetching user badges:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Exception fetching user badges:", error);
      return [];
    }
  }

  async checkForBadges(userId: string): Promise<void> {
    try {
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*');

      if (badgesError || !badges) {
        console.error("Error fetching badges:", badgesError);
        return;
      }

      const userStats = await statsService.getUserStats(userId);
      const userBadges = await this.getUserBadges(userId);
      
      if (!userStats) return;

      const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
      const newBadges: Badge[] = [];

      for (const badge of badges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        let isEarned = false;

        const criteria = badge.criteria;
        
        if (criteria.points_threshold && userStats.total_points >= criteria.points_threshold) {
          isEarned = true;
        }

        if (isEarned) {
          await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id
            });
            
          newBadges.push(badge);
        }
      }

      if (newBadges.length > 0) {
        console.log(`User ${userId} earned new badges:`, newBadges);
      }
    } catch (error) {
      console.error("Exception checking for badges:", error);
    }
  }
}

export const badgeService = new BadgeService();
