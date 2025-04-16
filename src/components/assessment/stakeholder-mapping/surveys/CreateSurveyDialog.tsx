
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SurveyTemplate } from '../StakeholderSurveys';

interface CreateSurveyDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateSurvey: (templateId: string, name: string) => void;
  templates: SurveyTemplate[];
}

export function CreateSurveyDialog({
  open,
  onClose,
  onCreateSurvey,
  templates
}: CreateSurveyDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [surveyName, setSurveyName] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null);

  useEffect(() => {
    if (open) {
      // Reset form
      setSelectedTemplateId('');
      setSurveyName('');
      setSelectedTemplate(null);
    }
  }, [open]);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template || null);
      
      // Pre-fill survey name based on template
      if (template) {
        setSurveyName(`${template.name} Survey`);
      }
    } else {
      setSelectedTemplate(null);
      setSurveyName('');
    }
  }, [selectedTemplateId, templates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplateId || !surveyName.trim()) {
      return;
    }
    
    onCreateSurvey(selectedTemplateId, surveyName);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Survey</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-select">Survey Template</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              required
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.stakeholderType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedTemplate && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">{selectedTemplate.name}</p>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedTemplate.questions.length} questions • For {selectedTemplate.stakeholderType}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="survey-name">Survey Name</Label>
            <Input
              id="survey-name"
              value={surveyName}
              onChange={(e) => setSurveyName(e.target.value)}
              placeholder="Enter a name for this survey"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!selectedTemplateId || !surveyName.trim()}
            >
              Create Survey
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
