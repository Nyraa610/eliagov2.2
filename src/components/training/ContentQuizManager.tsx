
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuizEditor from './QuizEditor';
import QuizPlayer from './QuizPlayer';
import { useToast } from '@/components/ui/use-toast';

interface ContentQuizManagerProps {
  contentItemId: string;
  isInstructorView?: boolean;
}

const ContentQuizManager: React.FC<ContentQuizManagerProps> = ({ 
  contentItemId, 
  isInstructorView = false 
}) => {
  const [activeTab, setActiveTab] = useState<string>(isInstructorView ? "edit" : "take");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const { toast } = useToast();

  const handleQuizComplete = (score: number) => {
    setQuizCompleted(true);
    setQuizScore(score);
    toast({
      title: "Quiz Completed",
      description: `You scored ${score} points on this quiz.`,
    });
  };

  const handleQuizSave = () => {
    toast({
      title: "Quiz Saved",
      description: "Your quiz questions have been saved successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {isInstructorView && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit Quiz</TabsTrigger>
              <TabsTrigger value="preview">Preview Quiz</TabsTrigger>
            </TabsList>
          )}
          
          {isInstructorView ? (
            <>
              <TabsContent value="edit" className="mt-4">
                <QuizEditor 
                  contentItemId={contentItemId} 
                  onSave={handleQuizSave} 
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <QuizPlayer 
                  contentItemId={contentItemId} 
                  onComplete={(score) => {
                    toast({
                      title: "Preview Score",
                      description: `You scored ${score} points in preview mode.`,
                    });
                  }} 
                />
              </TabsContent>
            </>
          ) : (
            <div className="mt-4">
              {quizCompleted ? (
                <div className="text-center py-8">
                  <h3 className="text-xl font-medium mb-2">Quiz Completed!</h3>
                  <p className="text-muted-foreground mb-4">
                    You scored {quizScore} points on this quiz.
                  </p>
                </div>
              ) : (
                <QuizPlayer 
                  contentItemId={contentItemId} 
                  onComplete={handleQuizComplete} 
                />
              )}
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentQuizManager;
