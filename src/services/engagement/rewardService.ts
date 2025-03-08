
import { supabase } from "@/lib/supabase";
import { Reward, UserReward } from "./types";
import { statsService } from "./statsService";

/**
 * Service for managing rewards
 */
class RewardService {
  async getUserRewards(userId?: string): Promise<UserReward[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const targetId = userId || userData.user?.id;
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

      const userStats = await statsService.getUserStats();
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
}

export const rewardService = new RewardService();
