
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SurveyQuestion, SurveyTemplate } from '../StakeholderSurveys';
import { toast } from 'sonner';

interface SurveyResponseFormProps {
  survey: {
    id: string;
    name: string;
    template: SurveyTemplate;
  };
  contactInfo?: {
    name: string;
    email: string;
  };
  onSubmit: (responses: any, contactInfo: any) => Promise<void>;
}

export function SurveyResponseForm({
  survey,
  contactInfo: initialContactInfo,
  onSubmit
}: SurveyResponseFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [contactInfo, setContactInfo] = useState({
    name: initialContactInfo?.name || '',
    email: initialContactInfo?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());

  const questions = survey.template.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex) / questions.length) * 100);

  useEffect(() => {
    // Initialize responses with empty values
    const initialResponses: Record<string, any> = {};
    questions.forEach(q => {
      if (q.type === 'multiple_choice') {
        initialResponses[q.id] = '';
      } else if (q.type === 'rating') {
        initialResponses[q.id] = 3; // Default to middle rating
      } else {
        initialResponses[q.id] = '';
      }
    });
    setResponses(initialResponses);
    setStartTime(new Date());
  }, [questions]);

  const handleInputChange = (questionId: string, value: any) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitSurvey();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitSurvey = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      toast.error("Please provide your name and email");
      return;
    }
    
    const endTime = new Date();
    const timeSpentMs = endTime.getTime() - startTime.getTime();
    
    setIsSubmitting(true);
    try {
      await onSubmit(
        { 
          ...responses, 
          completionTimeMs: timeSpentMs 
        }, 
        contactInfo
      );
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("Failed to submit your responses");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Thank You!</CardTitle>
          <CardDescription>
            Your feedback has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="h-24 w-24 text-green-500 mb-4" />
          <p className="text-center text-muted-foreground">
            We appreciate your time and insights. Your responses will help us improve our sustainability initiatives.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            Powered by Elia Go - Simplifying sustainability for businesses
          </p>
        </CardFooter>
      </Card>
    );
  }

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={responses[question.id] || ''}
            onValueChange={(value) => handleInputChange(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'rating':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Slider
                value={[responses[question.id] || 3]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => handleInputChange(question.id, value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 - Very Poor</span>
                <span>2 - Poor</span>
                <span>3 - Average</span>
                <span>4 - Good</span>
                <span>5 - Excellent</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-3xl font-bold text-primary">
                {responses[question.id] || 3}
              </div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <Textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Enter your response here..."
            rows={5}
          />
        );
      
      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{survey.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentQuestionIndex === questions.length ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Please provide your contact information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    placeholder="Your email address"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md text-sm">
              <p className="font-medium mb-2">About Elia Go:</p>
              <p className="text-muted-foreground">
                Elia Go is a comprehensive sustainability platform that helps businesses measure, manage, 
                and improve their environmental and social impact. Our solutions simplify sustainability 
                for organizations of all sizes, enabling them to meet regulatory requirements and build 
                a more sustainable future.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
            {renderQuestion(currentQuestion)}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <Button 
          variant="outline" 
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        {currentQuestionIndex === questions.length ? (
          <Button 
            onClick={handleSubmitSurvey}
            disabled={isSubmitting || !contactInfo.name || !contactInfo.email}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </Button>
        ) : (
          <Button 
            onClick={goToNextQuestion}
            disabled={
              isSubmitting || 
              (currentQuestion.type === 'text' && !responses[currentQuestion.id]) ||
              (currentQuestion.type === 'multiple_choice' && !responses[currentQuestion.id])
            }
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
