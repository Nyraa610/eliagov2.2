
import { useEffect, useState } from "react";
import { useEngagement } from "@/hooks/useEngagement";
import { RewardsSection } from "@/components/engagement/RewardsSection";
import { LeaderboardSection } from "@/components/engagement/LeaderboardSection";
import { TeamActivitiesSection } from "@/components/engagement/TeamActivitiesSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Gift, History, Trophy, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PersonalActivitiesTab } from "@/components/engagement/tabs/PersonalActivitiesTab";
import { supabase } from "@/lib/supabase";

export default function Engagement() {
  const { t } = useTranslation();
  const { trackActivity } = useEngagement();
  const [trackingSuccess, setTrackingSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    // First check if user is authenticated
    const verifyAndTrackActivity = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          console.log("No active session in Engagement page, skipping activity tracking");
          return;
        }
        
        console.log("Tracking Engagement page visit - authenticated user", session.session.user.id);
        
        // Track page view with additional points and verify it worked
        const success = await trackActivity({
          activity_type: 'visit_engagement_page',
          points_earned: 3,
          metadata: {
            explicit: true,
            path: '/engagement',
            user_id: session.session.user.id
          }
        }, true);
        
        setTrackingSuccess(success);
        
        if (success) {
          console.log("Successfully tracked engagement page visit");
        } else {
          console.warn("Failed to track engagement page visit - database operation failed");
        }
      } catch (error) {
        console.error("Error tracking engagement visit:", error);
        setTrackingSuccess(false);
      }
    };
    
    // Execute tracking immediately
    verifyAndTrackActivity();
  }, [trackActivity]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('engagement.title', 'Engagement & Rewards')}</h1>
        <p className="text-muted-foreground">
          {t('engagement.description', 'Track your progress, earn rewards, and compete with others on your sustainability journey.')}
          {trackingSuccess === false && (
            <span className="text-red-500 ml-2 font-medium">
              (Activity tracking is currently experiencing issues)
            </span>
          )}
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center justify-center gap-2">
            <History className="h-4 w-4" />
            {t('engagement.personal', 'Personal')}
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

        <TabsContent value="personal">
          <PersonalActivitiesTab />
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
    </div>
  );
}
