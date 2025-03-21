
/**
 * Type definitions for engagement service
 */

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
  activity_count?: number;
  time_spent_seconds?: number;
  last_active_at?: string;
}
