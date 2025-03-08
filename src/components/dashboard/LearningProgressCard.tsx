
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserEnrollment, Course } from "@/types/training";

interface LearningProgressCardProps {
  enrollments: (UserEnrollment & { courses: Course })[];
  isLoading: boolean;
}

export const LearningProgressCard = ({ enrollments, isLoading }: LearningProgressCardProps) => {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" /> {t('dashboard.learningProgress')}
        </CardTitle>
        <CardDescription>
          {t('dashboard.trackProgress')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="h-[120px] flex items-center justify-center">
              <p className="text-muted-foreground">{t('dashboard.loading')}</p>
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
              <p className="text-muted-foreground mb-4">{t('dashboard.noEnrollments')}</p>
              <Link to="/training" className="text-primary hover:underline">
                {t('dashboard.browseAvailable')}
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
