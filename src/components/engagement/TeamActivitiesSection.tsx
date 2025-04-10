
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useEngagement } from '@/hooks/useEngagement';
import { TeamActivitiesList } from './team/TeamActivitiesList';
import { TeamActivitiesSkeleton } from './team/TeamActivitiesSkeleton';
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export function TeamActivitiesSection() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getTeamActivities, startTeamTracking, teamActivities } = useEngagement();
  const trackingInitialized = useRef(false);
  
  const loadTeamActivities = async () => {
    setLoading(true);
    try {
      // Load historical activities
      const historicalActivities = await getTeamActivities();
      setActivities(historicalActivities);
    } catch (error) {
      console.error("Error loading team activities:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    
    const initTeamActivities = async () => {
      try {
        if (trackingInitialized.current) {
          return; // Prevent duplicate initialization
        }
        
        await loadTeamActivities();
        
        // Start real-time tracking only once
        if (!trackingInitialized.current) {
          console.log("Initializing team activity tracking");
          const cleanup = await startTeamTracking();
          cleanupFn = cleanup;
          trackingInitialized.current = true;
        }
      } catch (error) {
        console.error("Error initializing team activities:", error);
        setLoading(false);
      }
    };
    
    initTeamActivities();
    
    return () => {
      if (cleanupFn) {
        console.log("Cleaning up team activity tracking");
        cleanupFn();
        trackingInitialized.current = false;
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

  const handleRefresh = () => {
    loadTeamActivities();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Activities
          </CardTitle>
          <CardDescription>
            See what your team members are doing in real-time
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Refresh activities</span>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? <TeamActivitiesSkeleton /> : <TeamActivitiesList activities={activities} loading={loading} />}
      </CardContent>
    </Card>
  );
}
