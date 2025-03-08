
import { useEffect, useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trainingService } from "@/services/trainingService";
import { UserEnrollment, Course } from "@/types/training";
import { Award, Book, Target, TrendingUp, Globe, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { ESGNewsFeed } from "@/components/dashboard/ESGNewsFeed";
import { useTranslation } from "react-i18next";
import { CompanyAssessmentOverview } from "@/components/dashboard/CompanyAssessmentOverview";
import { useEngagement } from "@/hooks/useEngagement";
import { engagementService, UserEngagementStats } from "@/services/engagementService";

const Dashboard = () => {
  const { t } = useTranslation();
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
  
  return (
    <UserLayout title={t('dashboard.title')}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title={t('dashboard.totalPoints')}
          value={totalPoints}
          description={t('dashboard.pointsEarned')}
          icon={<Award className="h-5 w-5 text-primary" />}
        />
        <MetricCard 
          title={t('dashboard.coursesCompleted')}
          value={completedCourses}
          description={t('dashboard.outOf', { count: enrollments.length })}
          icon={<Book className="h-5 w-5 text-primary" />}
        />
        <MetricCard 
          title={t('dashboard.avgProgress')}
          value={`${Math.round(avgProgress)}%`}
          description={t('dashboard.avgProgressDesc')}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        <MetricCard 
          title={t('dashboard.esgImpact')}
          value="Positive"
          description={t('dashboard.esgImpactDesc')}
          icon={<Globe className="h-5 w-5 text-primary" />}
        />
      </div>
      
      <div className="grid gap-6 mt-6">
        <CompanyAssessmentOverview />
      </div>
      
      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> {t('dashboard.learningProgress')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.trackProgress')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="h-[120px] flex items-center justify-center">
                  <p className="text-muted-foreground">{t('dashboard.loading')}</p>
                </div>
              ) : enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm truncate">
                        {enrollment.courses?.title || "Course"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {enrollment.progress_percentage}%
                      </span>
                    </div>
                    <Progress value={enrollment.progress_percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">{t('dashboard.noEnrollments')}</p>
                  <Link to="/training" className="text-primary hover:underline">
                    {t('dashboard.browseAvailable')}
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> {t('dashboard.engagement')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.engagementDesc', 'Your rewards and achievements')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[120px] flex items-center justify-center">
                <p className="text-muted-foreground">{t('dashboard.loading')}</p>
              </div>
            ) : engagementStats ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">
                      {t('dashboard.engagementLevel', 'Engagement Level')}
                    </span>
                    <div className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                      {t('dashboard.level', 'Level')} {engagementStats.level}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{engagementStats.total_points} {t('dashboard.points', 'points')}</span>
                    <span>{t('dashboard.nextLevel', 'Next level')}: {(engagementStats.level + 1) * 100}</span>
                  </div>
                  <Progress 
                    value={(engagementStats.total_points % 100) / 100 * 100} 
                    className="h-2" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-muted/40 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {t('dashboard.activityCount', 'Activities')}
                      </span>
                    </div>
                    <p className="text-xl font-bold">
                      {engagementStats.activity_count}
                    </p>
                  </div>
                  
                  <div className="bg-muted/40 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {t('dashboard.timeSpent', 'Time Spent')}
                      </span>
                    </div>
                    <p className="text-xl font-bold">
                      {Math.floor(engagementStats.time_spent_seconds / 60)} {t('dashboard.mins', 'mins')}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Link 
                    to="/engagement" 
                    className="block w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-center rounded-md text-sm font-medium transition-colors"
                  >
                    {t('dashboard.viewRewards', 'View Rewards & Leaderboard')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.noEngagementData', 'No engagement data available yet.')}
                </p>
                <Link to="/engagement" className="text-primary hover:underline">
                  {t('dashboard.startEngaging', 'Start engaging with the platform')}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <ESGNewsFeed />
      </div>
    </UserLayout>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, description, icon }: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
