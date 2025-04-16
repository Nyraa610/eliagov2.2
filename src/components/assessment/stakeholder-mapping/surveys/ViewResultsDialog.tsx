
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Survey } from '../StakeholderSurveys';
import { SurveyResultsAnalysis } from './SurveyResultsAnalysis';
import { MessageSquare } from 'lucide-react';
import { EliaAIChat } from '@/components/assessment/ai/EliaAIChat';

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
  const [showAssistant, setShowAssistant] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{survey.name} - Results</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <SurveyResultsAnalysis survey={survey} />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowAssistant(true)}
          >
            <MessageSquare className="h-4 w-4" />
            Ask Elia about these results
          </Button>
        </DialogFooter>
      </DialogContent>

      {showAssistant && <EliaAIChat />}
    </Dialog>
  );
}
