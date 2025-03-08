
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { ESGNewsFeed } from "@/components/dashboard/ESGNewsFeed";
import { CompanyAssessmentOverview } from "@/components/dashboard/CompanyAssessmentOverview";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { LearningProgressCard } from "@/components/dashboard/LearningProgressCard";
import { EngagementStatsCard } from "@/components/dashboard/EngagementStatsCard";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { t } = useTranslation();
  const {
    enrollments,
    totalPoints,
    completedCourses,
    avgProgress,
    isLoading,
    engagementStats
  } = useDashboardData();
  
  return (
    <UserLayout title={t('dashboard.title')}>
      <DashboardMetrics 
        totalPoints={totalPoints} 
        completedCourses={completedCourses}
        enrollmentsCount={enrollments.length}
        avgProgress={avgProgress}
      />
      
      <div className="grid gap-6 mt-6">
        <CompanyAssessmentOverview />
      </div>
      
      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <LearningProgressCard 
          enrollments={enrollments} 
          isLoading={isLoading} 
        />
        <EngagementStatsCard 
          engagementStats={engagementStats} 
          isLoading={isLoading} 
        />
      </div>
      
      <div className="mt-6">
        <ESGNewsFeed />
      </div>
    </UserLayout>
  );
};

export default Dashboard;
