
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion, QuizAnswer } from "@/types/training";
import { trainingService } from "@/services/trainingService";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";

interface QuizPlayerProps {
  contentItemId: string;
  onComplete: (score: number) => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ contentItemId, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer[]>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<{
    totalPoints: number;
    earnedPoints: number;
    correctAnswers: number;
    totalQuestions: number;
    questionResults: Record<string, boolean>;
  }>({
    totalPoints: 0,
    earnedPoints: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    questionResults: {},
  });
  const { toast } = useToast();

  useEffect(() => {
    loadQuiz();
  }, [contentItemId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all questions for this content item
      const fetchedQuestions = await trainingService.getQuizQuestionsByContentItemId(contentItemId);
      setQuestions(fetchedQuestions);
      
      // Fetch answers for each question
      const answersMap: Record<string, QuizAnswer[]> = {};
      
      for (const question of fetchedQuestions) {
        const questionAnswers = await trainingService.getQuizAnswersByQuestionId(question.id);
        answersMap[question.id] = questionAnswers;
      }
      
      setAnswers(answersMap);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsCompleted(false);
      
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast({
        variant: "destructive",
        title: "Failed to Load Quiz",
        description: "There was an error loading the quiz. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelection = (questionId: string, answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswerOptions = currentQuestion ? answers[currentQuestion.id] || [] : [];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const questionResults: Record<string, boolean> = {};
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      
      const selectedAnswerId = selectedAnswers[question.id];
      if (!selectedAnswerId) {
        questionResults[question.id] = false;
        return;
      }
      
      const questionAnswers = answers[question.id] || [];
      const selectedAnswer = questionAnswers.find(a => a.id === selectedAnswerId);
      
      if (selectedAnswer?.is_correct) {
        correctAnswers++;
        earnedPoints += question.points;
        questionResults[question.id] = true;
      } else {
        questionResults[question.id] = false;
      }
    });
    
    setResults({
      totalPoints,
      earnedPoints,
      correctAnswers,
      totalQuestions: questions.length,
      questionResults
    });
    
    setIsCompleted(true);
    
    // Save the quiz result to the database
    saveQuizResult(earnedPoints);
  };

  const saveQuizResult = async (score: number) => {
    try {
      await trainingService.markContentAsCompleted(contentItemId, score);
      onComplete(score);
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Result",
        description: "Your quiz completion was recorded, but there was an error saving your score."
      });
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>No questions available for this quiz.</p>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
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
          <Button variant="outline" onClick={restartQuiz}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Quiz
          </Button>
          <Button onClick={() => onComplete(results.earnedPoints)}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium">
            {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
          </span>
        </div>
        <Progress 
          value={((currentQuestionIndex + 1) / questions.length) * 100} 
          className="h-1 mt-2" 
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
        
        <RadioGroup
          value={selectedAnswers[currentQuestion.id] || ""}
          onValueChange={(value) => handleAnswerSelection(currentQuestion.id, value)}
          className="space-y-2 mt-4"
        >
          {currentAnswerOptions.map((answer) => (
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
          onClick={handleNext}
          disabled={!selectedAnswers[currentQuestion.id]}
        >
          {currentQuestionIndex < questions.length - 1 ? (
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

export default QuizPlayer;
