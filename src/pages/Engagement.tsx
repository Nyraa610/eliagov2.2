
import { UserLayout } from "@/components/user/UserLayout";
import { useEffect } from "react";
import { useEngagement } from "@/hooks/useEngagement";
import { RewardsSection } from "@/components/engagement/RewardsSection";
import { LeaderboardSection } from "@/components/engagement/LeaderboardSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Gift, Award, Star } from "lucide-react";
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

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rewards" className="flex items-center justify-center gap-2">
            <Gift className="h-4 w-4" />
            {t('engagement.rewards', 'Rewards')}
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4" />
            {t('engagement.leaderboard', 'Leaderboard')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {t('engagement.pointsSystem', 'Points System')}
              </CardTitle>
              <CardDescription>
                {t('engagement.earnPointsDesc', 'Earn points by taking actions and completing tasks')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border border-muted">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{t('engagement.dailyLogin', 'Daily Login')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-primary">5 {t('engagement.points', 'pts')}</p>
                    <p className="text-xs text-muted-foreground">{t('engagement.loginDaily', 'Login daily to earn points')}</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{t('engagement.completeCourse', 'Complete a Course')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-primary">50 {t('engagement.points', 'pts')}</p>
                    <p className="text-xs text-muted-foreground">{t('engagement.finishTraining', 'Finish training modules')}</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{t('engagement.completeAssessment', 'Complete Assessment')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-primary">100 {t('engagement.points', 'pts')}</p>
                    <p className="text-xs text-muted-foreground">{t('engagement.finishAssessment', 'Complete any assessment')}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {t('engagement.badges', 'Badges')}
              </CardTitle>
              <CardDescription>
                {t('engagement.badgesDesc', 'Earn badges by reaching achievements')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-muted">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Award className="h-8 w-8 text-primary mb-2" />
                    <p className="font-medium">{t('engagement.badges.earlyAdopter', 'Early Adopter')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('engagement.badges.earlyAdopterDesc', 'One of the first to join')}</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Award className="h-8 w-8 text-primary mb-2" />
                    <p className="font-medium">{t('engagement.badges.trainingMaster', 'Training Master')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('engagement.badges.trainingMasterDesc', 'Complete 5 courses')}</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Award className="h-8 w-8 text-primary mb-2" />
                    <p className="font-medium">{t('engagement.badges.carbonChampion', 'Carbon Champion')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('engagement.badges.carbonChampionDesc', 'Complete carbon assessment')}</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Award className="h-8 w-8 text-primary mb-2" />
                    <p className="font-medium">{t('engagement.badges.esgPioneer', 'ESG Pioneer')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('engagement.badges.esgPioneerDesc', 'Complete all assessments')}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <RewardsSection />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardSection />
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}
