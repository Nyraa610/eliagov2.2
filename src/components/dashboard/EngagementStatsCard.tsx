
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Award, TrendingUp, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserEngagementStats } from "@/services/engagement";

interface EngagementStatsCardProps {
  engagementStats: UserEngagementStats | null;
  isLoading: boolean;
}

export const EngagementStatsCard = ({ engagementStats, isLoading }: EngagementStatsCardProps) => {
  const { t } = useTranslation();
  
  return (
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
  );
};
