
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Trash2, DragHandleDots2, AlertCircle } from 'lucide-react';
import { Survey, SurveyQuestion, SurveyTemplate } from '../StakeholderSurveys';
import { stakeholderService } from '@/services/stakeholderService';
import { toast } from 'sonner';

interface SurveyEditorDialogProps {
  open: boolean;
  onClose: () => void;
  survey: Survey | null;
}

export function SurveyEditorDialog({
  open,
  onClose,
  survey
}: SurveyEditorDialogProps) {
  const [surveyName, setSurveyName] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [template, setTemplate] = useState<SurveyTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && survey) {
      setSurveyName(survey.name);
      loadSurveyDetails();
    }
  }, [open, survey]);

  const loadSurveyDetails = async () => {
    if (!survey) return;
    
    setIsLoading(true);
    try {
      // Load the template with questions
      const templates = await stakeholderService.getSurveyTemplates();
      const foundTemplate = templates.find(t => t.id === survey.templateId);
      
      if (foundTemplate) {
        setTemplate(foundTemplate);
        // Clone the questions to avoid modifying the template directly
        setQuestions([...foundTemplate.questions]);
      }
    } catch (error) {
      console.error("Error loading survey details:", error);
      toast.error("Failed to load survey questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: `q-${Date.now()}`,
      text: 'New Question',
      type: 'multiple_choice',
      options: ['Option 1', 'Option 2', 'Option 3']
    };
    
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, text } : q
    ));
  };

  const handleQuestionTypeChange = (questionId: string, type: 'multiple_choice' | 'rating' | 'text') => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const updatedQuestion = { ...q, type };
        // If changing to multiple choice and no options exist, add default options
        if (type === 'multiple_choice' && (!q.options || q.options.length === 0)) {
          updatedQuestion.options = ['Option 1', 'Option 2', 'Option 3'];
        }
        return updatedQuestion;
      }
      return q;
    }));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const options = q.options || [];
        return { ...q, options: [...options, `Option ${options.length + 1}`] };
      }
      return q;
    }));
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options && q.options.length > 2) {
        const newOptions = [...q.options];
        newOptions.splice(optionIndex, 1);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    if (!survey || !template) return;
    
    if (!surveyName.trim()) {
      toast.error("Please enter a survey name");
      return;
    }
    
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }
    
    setIsSaving(true);
    try {
      // Create a new template with the modified questions
      const updatedTemplate: SurveyTemplate = {
        ...template,
        id: `${template.id}-custom-${Date.now()}`,
        name: `${template.name} (Modified)`,
        questions: questions
      };
      
      // Save the updated template
      await stakeholderService.saveSurveyTemplate(updatedTemplate);
      
      // Update the survey with the new template ID
      await stakeholderService.updateSurvey({
        ...survey,
        name: surveyName,
        templateId: updatedTemplate.id
      });
      
      toast.success("Survey updated successfully");
      onClose();
    } catch (error) {
      console.error("Error saving survey:", error);
      toast.error("Failed to save survey");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Survey</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading survey details...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="survey-name">Survey Name</Label>
              <Input
                id="survey-name"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                placeholder="Enter survey name"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Questions</Label>
                <Button 
                  onClick={handleAddQuestion} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Add Question
                </Button>
              </div>
              
              {questions.length === 0 ? (
                <div className="p-8 text-center border rounded-md">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No questions added yet.</p>
                  <Button 
                    onClick={handleAddQuestion} 
                    variant="outline" 
                    size="sm"
                    className="mt-4"
                  >
                    Add Your First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="relative">
                      <CardContent className="p-4 pt-4">
                        <div className="flex items-start gap-2">
                          <div className="pt-2 cursor-move text-gray-400">
                            <DragHandleDots2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                              <Label>Question Text</Label>
                              <Textarea 
                                value={question.text} 
                                onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                                rows={2}
                              />
                            </div>
                            
                            <div>
                              <Label>Question Type</Label>
                              <Select 
                                value={question.type} 
                                onValueChange={(value) => handleQuestionTypeChange(
                                  question.id, 
                                  value as 'multiple_choice' | 'rating' | 'text'
                                )}
                              >
                                <SelectTrigger className="mt-2">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                  <SelectItem value="rating">Rating</SelectItem>
                                  <SelectItem value="text">Text</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {question.type === 'multiple_choice' && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label>Options</Label>
                                  <Button 
                                    onClick={() => handleAddOption(question.id)} 
                                    variant="outline" 
                                    size="sm"
                                    className="flex items-center gap-1"
                                  >
                                    <PlusCircle className="h-3 w-3" /> Add
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {question.options?.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                                        placeholder={`Option ${optIndex + 1}`}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveOption(question.id, optIndex)}
                                        disabled={(question.options?.length || 0) <= 2}
                                        className="text-gray-500 hover:text-red-500"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(question.id)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
