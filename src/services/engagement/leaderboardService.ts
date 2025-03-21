
import { supabase } from "@/lib/supabase";
import { LeaderboardEntry, LeaderboardPeriod, LeaderboardScope } from "./types";
import { profileService } from "../base/profileService";

/**
 * Service for managing the leaderboard
 */
class LeaderboardService {
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
        .select('user_id, total_points, level, activity_count, time_spent_seconds, last_active_at')
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
      }
      
      // Get filtered user IDs for filtering stats data
      const filteredUserIds = filteredProfiles.map(profile => profile.id);
      
      // Filter stats data based on filtered profiles
      const filteredStatsData = scope === 'company' && companyId
        ? statsData.filter(stat => filteredUserIds.includes(stat.user_id))
        : statsData;

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
      return filteredStatsData.map((stat, index) => {
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
          rank: index + 1,
          activity_count: stat.activity_count,
          time_spent_seconds: stat.time_spent_seconds,
          last_active_at: stat.last_active_at
        };
      });
    } catch (error) {
      console.error("Exception fetching leaderboard:", error);
      return [];
    }
  }
}

export const leaderboardService = new LeaderboardService();
