
import { useEffect, useState } from 'react';
import { Medal, Clock } from 'lucide-react';
import { engagementService, UserEngagementStats } from '@/services/engagement';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

export function PointsDisplay() {
  const [stats, setStats] = useState<UserEngagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentlyActive, setIsCurrentlyActive] = useState<boolean>(true);

  const getNextLevelPoints = (level: number) => {
    // Simple formula for required points to level up
    return level * 100;
  };

  const getProgressToNextLevel = (stats: UserEngagementStats) => {
    const nextLevelPoints = getNextLevelPoints(stats.level);
    const currentLevelPoints = getNextLevelPoints(stats.level - 1);
    const pointsInCurrentLevel = stats.total_points - currentLevelPoints;
    const pointsRequiredForLevel = nextLevelPoints - currentLevelPoints;
    
    return Math.round((pointsInCurrentLevel / pointsRequiredForLevel) * 100);
  };

  // Format time spent in a human-readable way
  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  // Set up activity tracking for the status indicator
  useEffect(() => {
    const handleActivity = () => {
      setIsCurrentlyActive(true);
      resetInactivityTimer();
    };
    
    let inactivityTimer: number | null = null;
    
    const resetInactivityTimer = () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      
      inactivityTimer = window.setTimeout(() => {
        setIsCurrentlyActive(false);
      }, 5 * 60 * 1000); // 5 minutes of inactivity
    };
    
    // Track user interactions to detect activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    // Initialize the timer
    resetInactivityTimer();
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
    };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const userStats = await engagementService.getUserStats();
      setStats(userStats);
      setLoading(false);
    };

    fetchStats();

    // Listen for point changes and time changes in real-time
    const channel = supabase
      .channel('user_stats_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_engagement_stats',
          filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`,
        },
        (payload) => {
          setStats(payload.new as UserEngagementStats);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-1 text-primary px-3 py-1.5 text-sm">
        <Medal className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center space-x-1 text-primary px-3 py-1.5 rounded-md text-sm hover:bg-muted cursor-pointer">
          <Medal className="h-4 w-4" />
          <span className="font-medium">{stats.total_points} pts</span>
          <Badge variant="outline" className="ml-1">
            Lvl {stats.level}
          </Badge>
          {isCurrentlyActive && (
            <Clock className="h-3 w-3 text-green-500 ml-1" aria-label="Active time tracking" />
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Engagement Level</h4>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Level {stats.level}</span>
            <span>{stats.total_points} Points</span>
          </div>
          <Progress value={getProgressToNextLevel(stats)} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {getNextLevelPoints(stats.level) - stats.total_points} points needed for next level
          </p>
          
          <div className="mt-2 pt-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Activity Count:</span>
                <span>{stats.activity_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Time on Platform:</span>
                <span>{formatTimeSpent(stats.time_spent_seconds)}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Rewards:</span>
                <span>+10 pts / 30 mins active</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Tracking Status:</span>
                <span className={`flex items-center ${isCurrentlyActive ? 'text-green-500' : 'text-yellow-500'}`}>
                  <Clock className="h-3 w-3 mr-1" aria-label={isCurrentlyActive ? 'Active' : 'Paused (inactive)'} />
                  {isCurrentlyActive ? 'Active' : 'Paused (inactive)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
