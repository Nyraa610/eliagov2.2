
import { UserLayout } from "@/components/user/UserLayout";
import { useEffect } from "react";
import { useEngagement } from "@/hooks/useEngagement";
import { RewardsSection } from "@/components/engagement/RewardsSection";
import { LeaderboardSection } from "@/components/engagement/LeaderboardSection";
import { TeamActivitiesSection } from "@/components/engagement/TeamActivitiesSection";
import { ActivitiesTab } from "@/components/engagement/tabs/ActivitiesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Gift, Trophy, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Engagement() {
  const { t } = useTranslation();
  const { trackActivity } = useEngagement();

  useEffect(() => {
    // Track page view with additional points
    trackActivity({
      activity_type: 'visit_engagement_page',
      points_earned: 3,
    }, true);
  }, [trackActivity]);

  return (
    <UserLayout title={t('engagement.title', 'Engagement & Rewards')}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('engagement.subtitle', 'Your ESG Journey')}</h1>
        <p className="text-muted-foreground">
          {t('engagement.description', 'Track your progress, earn rewards, and compete with others on your sustainability journey.')}
        </p>
      </div>

      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities" className="flex items-center justify-center gap-2">
            <BarChart className="h-4 w-4" />
            {t('engagement.activities', 'Activities')}
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            {t('engagement.team', 'Team')}
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center justify-center gap-2">
            <Gift className="h-4 w-4" />
            {t('engagement.rewards', 'Rewards')}
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4" />
            {t('engagement.leaderboard', 'Leaderboard')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <ActivitiesTab />
        </TabsContent>
        
        <TabsContent value="team">
          <TeamActivitiesSection />
        </TabsContent>
        
        <TabsContent value="rewards">
          <RewardsSection />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardSection />
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}
