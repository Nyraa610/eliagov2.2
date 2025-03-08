
import { Award, Book, Globe, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MetricCard } from "./MetricCard";

interface DashboardMetricsProps {
  totalPoints: number;
  completedCourses: number;
  enrollmentsCount: number;
  avgProgress: number;
}

export const DashboardMetrics = ({ 
  totalPoints, 
  completedCourses, 
  enrollmentsCount, 
  avgProgress 
}: DashboardMetricsProps) => {
  const { t } = useTranslation();
  
  return (
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
        description={t('dashboard.outOf', { count: enrollmentsCount })}
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
  );
};
