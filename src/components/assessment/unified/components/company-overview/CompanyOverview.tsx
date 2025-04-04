
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCompanyAnalysis } from './hooks/useCompanyAnalysis';
import { CompanyInfoDisplay } from './CompanyInfoDisplay';
import { CompanyLoadingState } from './CompanyLoadingState';
import { CompanyErrorState } from './CompanyErrorState';
import { engagementService } from '@/services/engagement';
import { EditableCompanyInfoDisplay } from './EditableCompanyInfoDisplay';

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
    handleRetryAnalysis,
    analyzeCompany,
    setCompanyInfo
  } = useCompanyAnalysis();
  const [companyIdentifier, setCompanyIdentifier] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  const handleContinue = () => {
    // Track starting assessment with engagement service (award 5 points)
    engagementService.trackActivity({
      activity_type: 'start_assessment',
      points_earned: 5,
      metadata: {
        assessment_type: 'unified_esg',
        timestamp: new Date().toISOString()
      }
    }).catch(error => {
      console.error("Error tracking unified assessment start:", error);
    });
    
    onContinue();
  };

  const handleSaveCompanyInfo = (updatedInfo) => {
    setCompanyInfo(updatedInfo);
  };

  if (isLoadingCompanyInfo) {
    return <CompanyLoadingState 
      userCompany={userCompany} 
      analyzingProgress={analyzingProgress} 
    />;
  }

  if (analysisError && !companyInfo) {
    return (
      <CompanyErrorState 
        error={analysisError} 
        onRetry={handleRetryAnalysis}
      />
    );
  }

  return (
    <div className="space-y-6">
      {isEditable && companyInfo ? (
        <EditableCompanyInfoDisplay 
          companyInfo={companyInfo}
          onSave={handleSaveCompanyInfo}
        />
      ) : (
        <CompanyInfoDisplay companyInfo={companyInfo} />
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setIsEditable(!isEditable)} 
          disabled={!companyInfo}
        >
          {isEditable ? 'Cancel Editing' : 'Edit Company Info'}
        </Button>
        
        <Button onClick={handleContinue}>
          Continue to Assessment
        </Button>
      </div>
    </div>
  );
}
