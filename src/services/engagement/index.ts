
import { activityService } from './activityService';
import { badgeService } from './badgeService';
import { leaderboardService } from './leaderboardService';
import { rewardService } from './rewardService';
import { statsService } from './statsService';
import * as types from './types';

/**
 * Consolidated engagement service that exposes all sub-services
 */
class EngagementService {
  // Activity tracking
  trackActivity = activityService.trackActivity;
  trackTimeSpent = activityService.trackTimeSpent;
  getUserActivityHistory = activityService.getUserActivityHistory;
  
  // User stats
  getUserStats = statsService.getUserStats;
  
  // Badges
  getUserBadges = badgeService.getUserBadges;
  
  // Rewards
  getUserRewards = rewardService.getUserRewards;
  getAvailableRewards = rewardService.getAvailableRewards;
  redeemReward = rewardService.redeemReward;
  
  // Leaderboard
  getLeaderboard = leaderboardService.getLeaderboard;
}

// Create a singleton instance
export const engagementService = new EngagementService();

// Re-export types using the proper syntax
export type { 
  UserActivity,
  UserEngagementStats,
  Badge,
  UserBadge,
  Reward,
  UserReward,
  LeaderboardPeriod,
  LeaderboardScope,
  LeaderboardEntry 
} from './types';
