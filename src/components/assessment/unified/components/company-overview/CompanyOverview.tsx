
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useCompanyAnalysis } from "./hooks/useCompanyAnalysis";
import { CompanyLoadingState } from "./CompanyLoadingState";
import { CompanyErrorState } from "./CompanyErrorState";
import { CompanyInfoDisplay } from "./CompanyInfoDisplay";

interface CompanyOverviewProps {
  onContinue: () => void;
}

export function CompanyOverview({ onContinue }: CompanyOverviewProps) {
  const { 
    companyInfo, 
    userCompany, 
    analyzingProgress, 
    isLoadingCompanyInfo, 
    analysisError, 
    handleRetryAnalysis 
  } = useCompanyAnalysis();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Company Information
        </CardTitle>
        <CardDescription>
          We're automatically gathering information about your company to provide a more tailored assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!companyInfo ? (
          <div className="space-y-4">
            {isLoadingCompanyInfo ? (
              <CompanyLoadingState 
                userCompany={userCompany} 
                analyzingProgress={analyzingProgress} 
              />
            ) : analysisError ? (
              <CompanyErrorState 
                error={analysisError} 
                onRetry={handleRetryAnalysis} 
              />
            ) : null}
          </div>
        ) : (
          <CompanyInfoDisplay companyInfo={companyInfo} />
        )}
      </CardContent>
      <CardFooter>
        <div className="flex justify-end w-full">
          <Button 
            onClick={onContinue} 
            disabled={isLoadingCompanyInfo && !companyInfo}
          >
            Continue to Assessment
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
