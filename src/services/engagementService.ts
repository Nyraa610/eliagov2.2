import { supabase } from "@/lib/supabase";
import { authService } from "./base/authService";
import { profileService } from "./base/profileService";
import { useToast } from "@/hooks/use-toast";

export interface UserActivity {
  activity_type: string;
  points_earned: number;
  metadata?: Record<string, any>;
}

export interface UserEngagementStats {
  user_id: string;
  total_points: number;
  activity_count: number;
  time_spent_seconds: number;
  last_active_at: string;
  login_streak: number;
  level: number;
  company_id?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  criteria: Record<string, any>;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at: string;
  status: string;
  points_spent: number;
  reward?: Reward;
}

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all-time';
export type LeaderboardScope = 'company' | 'global';

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  total_points: number;
  level: number;
  rank: number;
}

class EngagementService {
  // Track a user activity
  async trackActivity(activity: UserActivity): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userData.user.id,
          activity_type: activity.activity_type,
          points_earned: activity.points_earned,
          metadata: activity.metadata || {}
        });

      if (error) {
        console.error("Error tracking activity:", error);
        return false;
      }

      await this.checkForBadges(userData.user.id);
      return true;
    } catch (error) {
      console.error("Exception tracking activity:", error);
      return false;
    }
  }

  // Track time spent on the application
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
        console.error("Error tracking time spent:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception tracking time spent:", error);
      return false;
    }
  }

  // Get a user's engagement stats
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

  // Get user's earned badges
  async getUserBadges(userId?: string): Promise<UserBadge[]> {
    try {
      const targetId = userId || (await authService.getCurrentUser())?.id;
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

  // Get user's redeemed rewards
  async getUserRewards(userId?: string): Promise<UserReward[]> {
    try {
      const targetId = userId || (await authService.getCurrentUser())?.id;
      if (!targetId) return [];

      const { data, error } = await supabase
        .from('user_rewards')
        .select('*, reward:rewards(*)')
        .eq('user_id', targetId);

      if (error) {
        console.error("Error fetching user rewards:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Exception fetching user rewards:", error);
      return [];
    }
  }

  // Get available rewards
  async getAvailableRewards(): Promise<Reward[]> {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) {
        console.error("Error fetching rewards:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Exception fetching rewards:", error);
      return [];
    }
  }

  // Redeem a reward
  async redeemReward(rewardId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      // Get user stats
      const userStats = await this.getUserStats();
      if (!userStats) return false;

      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', rewardId)
        .single();

      if (rewardError || !reward) {
        console.error("Error fetching reward:", rewardError);
        return false;
      }

      // Check if user has enough points
      if (userStats.total_points < reward.points_required) {
        return false;
      }

      // Begin transaction
      // 1. Add user_rewards record
      const { error: redeemError } = await supabase
        .from('user_rewards')
        .insert({
          user_id: userData.user.id,
          reward_id: rewardId,
          points_spent: reward.points_required
        });

      if (redeemError) {
        console.error("Error redeeming reward:", redeemError);
        return false;
      }

      // 2. Add point transaction record
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: userData.user.id,
          points: -reward.points_required,
          transaction_type: 'reward_redemption',
          description: `Redeemed reward: ${reward.name}`
        });

      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        return false;
      }

      // 3. Update user_engagement_stats
      const { error: updateError } = await supabase
        .from('user_engagement_stats')
        .update({ 
          total_points: userStats.total_points - reward.points_required 
        })
        .eq('user_id', userData.user.id);

      if (updateError) {
        console.error("Error updating user stats:", updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception redeeming reward:", error);
      return false;
    }
  }

  // Get leaderboard data
  async getLeaderboard(scope: LeaderboardScope = 'global', period: LeaderboardPeriod = 'all-time', limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      // First, get the company ID if scope is 'company'
      let companyId: string | null = null;
      if (scope === 'company') {
        const profile = await profileService.getUserProfile();
        if (!profile || !profile.company_id) return [];
        companyId = profile.company_id;
      }

      // Fetch the leaderboard data using a simpler query
      const { data, error } = await supabase
        .from('user_engagement_stats')
        .select(`
          user_id,
          total_points,
          level,
          profiles!inner(full_name, avatar_url, company_id),
          companies(name)
        `)
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
      }

      // Filter by company ID if needed
      let filteredData = data || [];
      if (scope === 'company' && companyId) {
        filteredData = filteredData.filter(
          item => item.profiles?.company_id === companyId
        );
      }

      // Transform the data to match our expected format
      return filteredData.map((entry, index) => ({
        user_id: entry.user_id,
        full_name: entry.profiles?.full_name || 'Anonymous User',
        avatar_url: entry.profiles?.avatar_url,
        company_name: entry.companies?.length > 0 ? entry.companies[0].name : null,
        total_points: entry.total_points,
        level: entry.level,
        rank: index + 1
      }));
    } catch (error) {
      console.error("Exception fetching leaderboard:", error);
      return [];
    }
  }

  // Check for new badges
  private async checkForBadges(userId: string): Promise<void> {
    try {
      // Get all badges
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*');

      if (badgesError || !badges) {
        console.error("Error fetching badges:", badgesError);
        return;
      }

      // Get user's current stats and existing badges
      const userStats = await this.getUserStats(userId);
      const userBadges = await this.getUserBadges(userId);
      
      if (!userStats) return;

      const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
      const newBadges: Badge[] = [];

      // Check each badge criteria
      for (const badge of badges) {
        // Skip already earned badges
        if (earnedBadgeIds.includes(badge.id)) continue;

        let isEarned = false;

        // Check different badge criteria types
        const criteria = badge.criteria;
        
        // Points threshold badge
        if (criteria.points_threshold && userStats.total_points >= criteria.points_threshold) {
          isEarned = true;
        }
        
        // Other criteria checks would go here...

        if (isEarned) {
          // Award the badge
          await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id
            });
            
          newBadges.push(badge);
        }
      }

      // If new badges were earned, we could trigger notifications here
      if (newBadges.length > 0) {
        console.log(`User ${userId} earned new badges:`, newBadges);
      }
    } catch (error) {
      console.error("Exception checking for badges:", error);
    }
  }
}

export const engagementService = new EngagementService();
