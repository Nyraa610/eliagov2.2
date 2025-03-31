
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEngagement } from '@/hooks/useEngagement';
import { formatDistanceToNow } from 'date-fns';

export function TeamActivitiesSection() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getTeamActivities, startTeamTracking, teamActivities } = useEngagement();
  
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    
    const initTeamActivities = async () => {
      setLoading(true);
      try {
        // Load historical activities
        const historicalActivities = await getTeamActivities();
        setActivities(historicalActivities);
        
        // Start real-time tracking
        const cleanup = await startTeamTracking();
        cleanupFn = cleanup;
      } catch (error) {
        console.error("Error loading team activities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initTeamActivities();
    
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [getTeamActivities, startTeamTracking]);
  
  // Listen for real-time team activities from the hook
  useEffect(() => {
    if (teamActivities.length > 0) {
      setActivities(prevActivities => {
        const newActivities = [...teamActivities, ...prevActivities];
        // Limit to prevent too many activities
        return newActivities.slice(0, 50);
      });
    }
  }, [teamActivities]);

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Activities
        </CardTitle>
        <CardDescription>
          See what your team members are doing in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <p>Loading team activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No team activities yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Activities will appear here when your team members use the platform.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.profiles?.avatar_url} />
                  <AvatarFallback>{(activity.profiles?.full_name || 'User').substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {activity.profiles?.full_name || 'Team Member'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatActivityType(activity.activity_type)} (+{activity.points_earned} points)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
