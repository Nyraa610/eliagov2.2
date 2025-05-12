
import { useTranslation } from "react-i18next";
import { ESGNewsFeed } from "@/components/dashboard/ESGNewsFeed";
import { CompanyAssessmentOverview } from "@/components/dashboard/CompanyAssessmentOverview";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { LearningProgressCard } from "@/components/dashboard/LearningProgressCard";
import { EngagementStatsCard } from "@/components/dashboard/EngagementStatsCard";
import { ESGLaunchpadCard } from "@/components/dashboard/ESGLaunchpadCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSelectedClient } from "@/hooks/useSelectedClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building } from "lucide-react";
import { useState, useEffect } from 'react';
import { useRoleCheck } from "@/components/user/sidebar/hooks/useRoleCheck";

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
  
  const { clientId, clientName, isLoading: clientLoading } = useSelectedClient();
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const { isConsultant } = useRoleCheck();
  
  // Check if the user has completed the launchpad
  // We'll show it if they're new or haven't completed it
  useEffect(() => {
    const hasCompletedLaunchpad = localStorage.getItem("esg-launchpad-completed") === "true";
    const isNewUser = localStorage.getItem("user-first-visit") === null;
    
    if (isNewUser) {
      localStorage.setItem("user-first-visit", new Date().toISOString());
      setShowLaunchpad(true);
    } else if (!hasCompletedLaunchpad) {
      setShowLaunchpad(true);
    }
  }, []);
  
  return (
    <>
      {isConsultant && clientId && (
        <Alert className="mb-6 bg-muted/50">
          <Building className="h-4 w-4" />
          <AlertTitle>Consultant View</AlertTitle>
          <AlertDescription>
            You are currently viewing data for client: <strong>{clientName}</strong>
          </AlertDescription>
        </Alert>
      )}
      
      {showLaunchpad && (
        <div className="mb-6">
          <ESGLaunchpadCard />
        </div>
      )}
      
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
    </>
  );
};

export default Dashboard;
