import { useEffect, useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trainingService } from "@/services/trainingService";
import { UserEnrollment, Course } from "@/types/training";
import { Award, Book, Target, TrendingUp, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { ESGNewsFeed } from "@/components/dashboard/ESGNewsFeed";
import { useTranslation } from "react-i18next";
import { CompanyAssessmentOverview } from "@/components/dashboard/CompanyAssessmentOverview";

const Dashboard = () => {
  const { t } = useTranslation();
  const [enrollments, setEnrollments] = useState<(UserEnrollment & { courses: Course })[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [avgProgress, setAvgProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userEnrollments = await trainingService.getUserEnrollments();
        setEnrollments(userEnrollments as any);
        
        const totalEnrollments = userEnrollments.length;
        const completed = userEnrollments.filter(e => e.is_completed).length;
        setCompletedCourses(completed);
        
        const points = userEnrollments.reduce((sum, e) => sum + e.points_earned, 0);
        setTotalPoints(points);
        
        const avgProg = totalEnrollments > 0 
          ? userEnrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / totalEnrollments 
          : 0;
        setAvgProgress(avgProg);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
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
