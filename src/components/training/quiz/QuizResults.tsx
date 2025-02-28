
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion, QuizAnswer } from "@/types/training";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";

interface QuizResultsProps {
  questions: QuizQuestion[];
  answers: Record<string, QuizAnswer[]>;
  selectedAnswers: Record<string, string>;
  results: {
    totalPoints: number;
    earnedPoints: number;
    correctAnswers: number;
    totalQuestions: number;
    questionResults: Record<string, boolean>;
  };
  onRestart: () => void;
  onComplete: (score: number) => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  questions,
  answers,
  selectedAnswers,
  results,
  onRestart,
  onComplete,
}) => {
  const scorePercentage = Math.round((results.earnedPoints / results.totalPoints) * 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Quiz Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center mb-4">
          <Trophy className="h-16 w-16 text-primary" />
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold">{scorePercentage}%</h3>
          <p className="text-muted-foreground">
            You scored {results.earnedPoints} out of {results.totalPoints} points
          </p>
        </div>
        
        <Progress value={scorePercentage} className="h-2 mb-6" />
        
        <div className="text-center mb-4">
          <p className="font-medium">
            {results.correctAnswers} correct answers out of {results.totalQuestions} questions
          </p>
        </div>
        
        <div className="space-y-4 mt-6">
          <h4 className="font-medium">Question Summary:</h4>
          
          {questions.map((question, index) => (
            <div key={question.id} className="flex items-start space-x-3 pb-3 border-b">
              <div className="mt-0.5">
                {results.questionResults[question.id] ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Question {index + 1}: {question.question_text}</p>
                
                {/* Show the answer details */}
                <div className="mt-1 text-sm">
                  {answers[question.id]?.map(answer => {
                    const isSelected = selectedAnswers[question.id] === answer.id;
                    const isCorrect = answer.is_correct;
                    
                    let textClass = 'text-muted-foreground';
                    if (isSelected && isCorrect) textClass = 'text-green-600 font-medium';
                    else if (isSelected && !isCorrect) textClass = 'text-red-600 font-medium';
                    else if (!isSelected && isCorrect) textClass = 'text-green-600 font-medium';
                    
                    return (
                      <p key={answer.id} className={textClass}>
                        {isSelected ? '✓ ' : isCorrect ? '• ' : ''}
                        {answer.answer_text}
                        {!isSelected && isCorrect && ' (Correct answer)'}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onRestart}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Retry Quiz
        </Button>
        <Button onClick={() => onComplete(results.earnedPoints)}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizResults;
