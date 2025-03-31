
export interface UserActivity {
  activity_type: string;
  points_earned: number;
  metadata?: Record<string, any>;
}

export interface UserEngagementStats {
  user_id: string;
  total_points: number;
  level: number;
  activity_count: number;
  time_spent_seconds: number;
  last_active_at: string;
  login_streak?: number;
  last_login_date?: string;
  company_id?: string;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  criteria: {
    points_threshold?: number;
    activities_threshold?: number;
    specific_activities?: string[];
  };
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge: Badge;
  earned_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  points_required: number;
  is_active: boolean;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';
export type LeaderboardScope = 'global' | 'company' | 'department';

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url?: string | null;
  company_name?: string | null;
  total_points: number;
  level: number;
  rank: number;
  activity_count?: number;
  time_spent_seconds?: number;
  last_active_at?: string;
}
