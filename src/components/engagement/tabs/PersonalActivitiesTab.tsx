
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { engagementService } from "@/services/engagement";
import { PersonalActivitiesList } from "../personal/PersonalActivitiesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivitiesTab } from "./ActivitiesTab";
import { useTranslation } from "react-i18next";

export function PersonalActivitiesTab() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();

  const loadActivities = async () => {
    setLoading(true);
    try {
      const personalActivities = await engagementService.getUserActivityHistory();
      setActivities(personalActivities);
    } catch (error) {
      console.error("Error loading personal activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleRefresh = () => {
    loadActivities();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {t('engagement.personal.title', 'Your Engagement')}
          </CardTitle>
          <CardDescription>
            {t('engagement.personal.description', 'Track your points, badges, and activities')}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Refresh activities</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="system" className="space-y-4">
          <TabsList>
            <TabsTrigger value="system">{t('engagement.tabs.system', 'Points & Badges')}</TabsTrigger>
            <TabsTrigger value="history">{t('engagement.tabs.history', 'Activity History')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system" className="space-y-4">
            <ActivitiesTab />
          </TabsContent>
          
          <TabsContent value="history">
            <PersonalActivitiesList activities={activities} loading={loading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
