
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

  async redeemReward(rewardId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const userStats = await this.getUserStats();
      if (!userStats) return false;

      const { data: reward, error: rewardError } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', rewardId)
        .single();

      if (rewardError || !reward) {
        console.error("Error fetching reward:", rewardError);
        return false;
      }

      if (userStats.total_points < reward.points_required) {
        return false;
      }

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

  async getLeaderboard(scope: LeaderboardScope = 'global', period: LeaderboardPeriod = 'all-time', limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      let companyId: string | null = null;
      if (scope === 'company') {
        const profile = await profileService.getUserProfile();
        if (!profile || !profile.company_id) return [];
        companyId = profile.company_id;
      }

      // Fetch user engagement stats first
      const { data: statsData, error: statsError } = await supabase
        .from('user_engagement_stats')
        .select('user_id, total_points, level')
        .order('total_points', { ascending: false })
        .limit(limit);

      if (statsError) {
        console.error("Error fetching leaderboard stats:", statsError);
        return [];
      }

      if (!statsData || statsData.length === 0) {
        return [];
      }

      // Get user IDs from the stats
      const userIds = statsData.map(stat => stat.user_id);

      // Fetch profile data for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, company_id')
        .in('id', userIds);

      if (profilesError) {
        console.error("Error fetching profile data:", profilesError);
        return [];
      }

      // If company scope, filter profiles by company ID
      let filteredProfiles = profilesData || [];
      if (scope === 'company' && companyId) {
        filteredProfiles = filteredProfiles.filter(
          profile => profile.company_id === companyId
        );
        
        // Re-filter stats to match the filtered profiles
        const filteredUserIds = filteredProfiles.map(profile => profile.id);
        statsData = statsData.filter(stat => filteredUserIds.includes(stat.user_id));
      }

      // Get company IDs from profiles for company name lookup
      const companyIds = filteredProfiles
        .map(profile => profile.company_id)
        .filter(id => id !== null) as string[];

      // Fetch company data if needed
      let companiesData: any[] = [];
      if (companyIds.length > 0) {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds);

        if (!companiesError) {
          companiesData = companies || [];
        }
      }

      // Combine the data
      return statsData.map((stat, index) => {
        const profile = filteredProfiles.find(p => p.id === stat.user_id);
        const company = profile?.company_id 
          ? companiesData.find(c => c.id === profile.company_id) 
          : null;

        return {
          user_id: stat.user_id,
          full_name: profile?.full_name || 'Anonymous User',
          avatar_url: profile?.avatar_url,
          company_name: company?.name || null,
          total_points: stat.total_points,
          level: stat.level,
          rank: index + 1
        };
      });
    } catch (error) {
      console.error("Exception fetching leaderboard:", error);
      return [];
    }
  }

  private async checkForBadges(userId: string): Promise<void> {
    try {
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*');

      if (badgesError || !badges) {
        console.error("Error fetching badges:", badgesError);
        return;
      }

      const userStats = await this.getUserStats(userId);
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

export const engagementService = new EngagementService();
