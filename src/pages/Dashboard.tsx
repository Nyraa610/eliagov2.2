
import { useEffect, useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trainingService } from "@/services/trainingService";
import { UserEnrollment, Course } from "@/types/training";
import { Award, Book, Target, TrendingUp, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { ESGNewsFeed } from "@/components/dashboard/ESGNewsFeed";

const Dashboard = () => {
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
    <UserLayout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Points" 
          value={totalPoints}
          description="Points earned across all courses"
          icon={<Award className="h-5 w-5 text-primary" />}
        />
        <MetricCard 
          title="Courses Completed" 
          value={completedCourses}
          description={`Out of ${enrollments.length} enrolled courses`}
          icon={<Book className="h-5 w-5 text-primary" />}
        />
        <MetricCard 
          title="Avg. Progress" 
          value={`${Math.round(avgProgress)}%`}
          description="Average progress across all courses"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        <MetricCard 
          title="ESG Impact" 
          value="Positive"
          description="Based on your training progress"
          icon={<Globe className="h-5 w-5 text-primary" />}
        />
      </div>
      
      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Your Learning Progress
            </CardTitle>
            <CardDescription>
              Track your progress through all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="h-[120px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading progress data...</p>
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
                  <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                  <Link to="/training" className="text-primary hover:underline">
                    Browse available courses
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
