
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion as QuizQuestionType, QuizAnswer } from "@/types/training";
import { ArrowRight } from "lucide-react";

interface QuizQuestionProps {
  question: QuizQuestionType;
  answers: QuizAnswer[];
  currentIndex: number;
  totalQuestions: number;
  selectedAnswerId: string | undefined;
  onAnswerSelect: (questionId: string, answerId: string) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  answers,
  currentIndex,
  totalQuestions,
  selectedAnswerId,
  onAnswerSelect,
  onNext,
  isLastQuestion,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-medium">
            {question.points} {question.points === 1 ? 'point' : 'points'}
          </span>
        </div>
        <Progress 
          value={((currentIndex + 1) / totalQuestions) * 100} 
          className="h-1 mt-2" 
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <CardTitle className="text-lg">{question.question_text}</CardTitle>
        
        <RadioGroup
          value={selectedAnswerId || ""}
          onValueChange={(value) => onAnswerSelect(question.id, value)}
          className="space-y-2 mt-4"
        >
          {answers.map((answer) => (
            <div key={answer.id} className="flex items-center space-x-2">
              <RadioGroupItem id={answer.id} value={answer.id} />
              <Label htmlFor={answer.id} className="cursor-pointer">
                {answer.answer_text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          onClick={onNext}
          disabled={!selectedAnswerId}
        >
          {!isLastQuestion ? (
            <>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            'Complete Quiz'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizQuestion;
