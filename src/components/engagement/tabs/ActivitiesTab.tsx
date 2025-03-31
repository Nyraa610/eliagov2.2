
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BarChart, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ActivitiesTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            {t('engagement.activityPoints', 'Activity Points')}
          </CardTitle>
          <CardDescription>
            {t('engagement.activityPointsDesc', 'Points you can earn from various activities')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border border-muted">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{t('engagement.assessment.title', 'Assessment Activities')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.assessment.start', 'Start Assessment')}</span>
                  <span className="font-medium text-primary">5 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.assessment.milestone', 'Reach 50% Progress')}</span>
                  <span className="font-medium text-primary">10 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.assessment.complete', 'Complete Assessment')}</span>
                  <span className="font-medium text-primary">50 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.assessment.addItem', 'Add Assessment Item')}</span>
                  <span className="font-medium text-primary">5 pts</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-muted">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{t('engagement.training.title', 'Training Activities')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.training.start', 'Start Course')}</span>
                  <span className="font-medium text-primary">3 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.training.completeModule', 'Complete Module')}</span>
                  <span className="font-medium text-primary">10 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.training.passQuiz', 'Pass Quiz')}</span>
                  <span className="font-medium text-primary">15 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.training.completeCourse', 'Complete Course')}</span>
                  <span className="font-medium text-primary">50 pts</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-muted">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{t('engagement.general.title', 'General Activities')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.general.login', 'Daily Login')}</span>
                  <span className="font-medium text-primary">5 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.general.viewPage', 'View Page')}</span>
                  <span className="font-medium text-primary">1 pt</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.general.timeSpent', '30 Min on Platform')}</span>
                  <span className="font-medium text-primary">3 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('engagement.general.profile', 'Complete Profile')}</span>
                  <span className="font-medium text-primary">10 pts</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
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
    </div>
  );
}
