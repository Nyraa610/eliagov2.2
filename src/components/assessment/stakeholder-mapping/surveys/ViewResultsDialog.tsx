
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Survey } from '../StakeholderSurveys';
import { SurveyResultsAnalysis } from './SurveyResultsAnalysis';

interface ViewResultsDialogProps {
  open: boolean;
  onClose: () => void;
  survey: Survey;
}

export function ViewResultsDialog({
  open,
  onClose,
  survey
}: ViewResultsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{survey.name} - Results</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <SurveyResultsAnalysis survey={survey} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
