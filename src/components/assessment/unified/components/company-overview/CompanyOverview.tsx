
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCompanyAnalysis } from './hooks/useCompanyAnalysis';
import { CompanyInfoDisplay } from './CompanyInfoDisplay';
import { CompanyLoadingState } from './CompanyLoadingState';
import { CompanyErrorState } from './CompanyErrorState';
import { engagementService } from '@/services/engagement';

interface CompanyOverviewProps {
  onContinue: () => void;
}

export function CompanyOverview({ onContinue }: CompanyOverviewProps) {
  const { 
    companyData, 
    isLoading, 
    error, 
    companyId, 
    fetchCompanyInfo,
    isEditable,
    editedCompanyData
  } = useCompanyAnalysis();
  const [companyIdentifier, setCompanyIdentifier] = useState('');

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

  if (isLoading) {
    return <CompanyLoadingState />;
  }

  if (error && !companyData) {
    return (
      <CompanyErrorState 
        error={error} 
        companyIdentifier={companyIdentifier}
        setCompanyIdentifier={setCompanyIdentifier}
        onSearch={fetchCompanyInfo}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CompanyInfoDisplay 
        companyData={editedCompanyData || companyData} 
        companyId={companyId}
        isEditable={isEditable}
      />
      
      <div className="flex justify-end">
        <Button onClick={handleContinue}>
          Continue to Assessment
        </Button>
      </div>
    </div>
  );
}
