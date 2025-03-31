
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, CalendarDays, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEngagement } from "@/hooks/useEngagement";
import { format } from "date-fns";

export const TeamActivitiesSection = () => {
  const { t } = useTranslation();
  const { getTeamActivities, startTeamTracking, teamActivities } = useEngagement();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  
  // Format activity type for display
  const formatActivityType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Initialize team activity tracking
  useEffect(() => {
    const cleanup = startTeamTracking();
    return () => {
      if (cleanup) cleanup();
    };
  }, [startTeamTracking]);
  
  // Load team activities on mount and when period changes
  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        const data = await getTeamActivities(50);
        
        // Filter based on selected time period
        const now = new Date();
        const filteredData = data.filter((activity: any) => {
          const activityDate = new Date(activity.created_at);
          
          if (period === 'today') {
            return activityDate.toDateString() === now.toDateString();
          } else if (period === 'week') {
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            return activityDate >= oneWeekAgo;
          } else if (period === 'month') {
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(now.getMonth() - 1);
            return activityDate >= oneMonthAgo;
          }
          return true;
        });
        
        setActivities(filteredData);
      } catch (error) {
        console.error("Error loading team activities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadActivities();
  }, [getTeamActivities, period, teamActivities.length]);
  
  // Update activities when new team activities come in realtime
  useEffect(() => {
    if (teamActivities.length > 0) {
      // Check if the new activity should be included based on time period
      const now = new Date();
      const latestActivity = teamActivities[teamActivities.length - 1];
      const activityDate = new Date(latestActivity.created_at);
      
      let shouldInclude = false;
      if (period === 'today') {
        shouldInclude = activityDate.toDateString() === now.toDateString();
      } else if (period === 'week') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        shouldInclude = activityDate >= oneWeekAgo;
      } else if (period === 'month') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        shouldInclude = activityDate >= oneMonthAgo;
      }
      
      if (shouldInclude) {
        // Add to activities state
        setActivities(prev => [latestActivity, ...prev].slice(0, 50));
      }
    }
  }, [teamActivities, period]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t('engagement.teamActivities', 'Team Activities')}
        </CardTitle>
        <CardDescription>
          {t('engagement.teamActivitiesDesc', 'See what your team is doing')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="today" onClick={() => setPeriod('today')}>
                {t('engagement.today', 'Today')}
              </TabsTrigger>
              <TabsTrigger value="week" onClick={() => setPeriod('week')}>
                {t('engagement.thisWeek', 'This Week')}
              </TabsTrigger>
              <TabsTrigger value="month" onClick={() => setPeriod('month')}>
                {t('engagement.thisMonth', 'This Month')}
              </TabsTrigger>
            </TabsList>
            
            <Badge variant="outline" className="ml-auto">
              {activities.length} {t('engagement.activities', 'activities')}
            </Badge>
          </div>
          
          <TabsContent value="today" className="m-0">
            <ActivityFeed activities={activities} loading={loading} period="today" />
          </TabsContent>
          
          <TabsContent value="week" className="m-0">
            <ActivityFeed activities={activities} loading={loading} period="week" />
          </TabsContent>
          
          <TabsContent value="month" className="m-0">
            <ActivityFeed activities={activities} loading={loading} period="month" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface ActivityFeedProps {
  activities: any[];
  loading: boolean;
  period: 'today' | 'week' | 'month';
}

const ActivityFeed = ({ activities, loading, period }: ActivityFeedProps) => {
  const { t } = useTranslation();
  
  // Format activity type for display
  const formatActivityType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Get user's initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse flex flex-col gap-2 w-full">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mb-2 opacity-20" />
        <p className="text-sm">
          {t('engagement.noTeamActivities', 'No team activities found for this period')}
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => {
          const profile = activity.profiles || {};
          
          return (
            <div 
              key={activity.id} 
              className="flex gap-4 p-3 border rounded-lg hover:bg-muted/40 transition-colors"
            >
              <Avatar>
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
                <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium text-sm">
                    {profile.full_name || t('engagement.teamMember', 'Team Member')}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <span>{format(new Date(activity.created_at), 'MMM d, HH:mm')}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {formatActivityType(activity.activity_type)}
                </p>
                
                <div className="flex items-center gap-1 mt-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {activity.points_earned} {t('engagement.points', 'pts')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
