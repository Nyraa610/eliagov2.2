
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ResultsContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  reportUrl?: string;
  showDeliverables?: boolean;
  additionalActions?: React.ReactNode;
}

export const ResultsContainer: React.FC<ResultsContainerProps> = ({
  title,
  description,
  children,
  reportUrl,
  showDeliverables = false,
  additionalActions
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("assessment.results.summary", "Results Summary")}</CardTitle>
          <CardDescription>{t("assessment.results.summaryDescription", "Review the findings and recommendations from your assessment")}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          
          <div className="flex flex-wrap gap-4 mt-8">
            {reportUrl && reportUrl !== "#" && (
              <Button className="gap-2" asChild>
                <a href={reportUrl} download>
                  <Download className="h-4 w-4" />
                  {t("assessment.results.downloadReport", "Download Report")}
                </a>
              </Button>
            )}
            
            {additionalActions}
            
        
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
