
import { useState, useEffect } from "react";
import { trainingService } from "@/services/trainingService";
import { engagementService } from "@/services/engagement";
import { UserEnrollment, Course } from "@/types/training";
import { UserEngagementStats } from "@/services/engagement";
import { useEngagement } from "@/hooks/useEngagement";

export const useDashboardData = () => {
  const [enrollments, setEnrollments] = useState<(UserEnrollment & { courses: Course })[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [avgProgress, setAvgProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [engagementStats, setEngagementStats] = useState<UserEngagementStats | null>(null);
  const { trackActivity } = useEngagement();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userEnrollments, stats] = await Promise.all([
          trainingService.getUserEnrollments(),
          engagementService.getUserStats()
        ]);
        
        setEnrollments(userEnrollments as any);
        setEngagementStats(stats);
        
        const totalEnrollments = userEnrollments.length;
        const completed = userEnrollments.filter(e => e.is_completed).length;
        setCompletedCourses(completed);
        
        const points = userEnrollments.reduce((sum, e) => sum + e.points_earned, 0);
        setTotalPoints(points);
        
        const avgProg = totalEnrollments > 0 
          ? userEnrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / totalEnrollments 
          : 0;
        setAvgProgress(avgProg);
        
        // Track dashboard view
        trackActivity({
          activity_type: 'view_dashboard',
          points_earned: 2
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [trackActivity]);
  
  return {
    enrollments,
    totalPoints,
    completedCourses,
    avgProgress,
    isLoading,
    engagementStats
  };
};
