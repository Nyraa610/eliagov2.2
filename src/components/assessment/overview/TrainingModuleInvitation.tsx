
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function TrainingModuleInvitation() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) {
    return null;
  }
  
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {t("assessment.training.recommendedTitle", "Recommended Learning")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">ESG 101 - Introduction</h3>
            <p className="text-sm text-muted-foreground">
              {t("assessment.training.description", "Learn the fundamentals of ESG before starting your assessment for better results.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDismissed(true)}
            >
              {t("assessment.training.dismiss", "Dismiss")}
            </Button>
            <Button
              as={Link}
              to="/training" 
              size="sm"
              className="gap-1"
            >
              {t("assessment.training.startLearning", "Start Learning")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
