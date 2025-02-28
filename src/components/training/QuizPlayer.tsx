
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQuiz } from "@/hooks/useQuiz";
import QuizQuestion from "./quiz/QuizQuestion";
import QuizResults from "./quiz/QuizResults";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";

interface QuizPlayerProps {
  contentItemId: string;
  onComplete: (score: number) => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ contentItemId, onComplete }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  
  const {
    questions,
    currentQuestionIndex,
    answers,
    selectedAnswers,
    isLoading,
    isCompleted,
    results,
    currentQuestion,
    currentAnswerOptions,
    handleAnswerSelection,
    handleNext,
    restartQuiz
  } = useQuiz(contentItemId, onComplete);

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

  if (!quizStarted) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">Ready to Start Quiz?</h2>
          <p className="text-muted-foreground">
            This quiz contains {questions.length} questions and is worth a total of{" "}
            {questions.reduce((total, q) => total + q.points, 0)} points.
          </p>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <Button 
            onClick={() => setQuizStarted(true)}
            size="lg"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <QuizResults
        questions={questions}
        answers={answers}
        selectedAnswers={selectedAnswers}
        results={results}
        onRestart={() => {
          restartQuiz();
          setQuizStarted(true);
        }}
        onComplete={onComplete}
      />
    );
  }

  return (
    <QuizQuestion
      question={currentQuestion}
      answers={currentAnswerOptions}
      currentIndex={currentQuestionIndex}
      totalQuestions={questions.length}
      selectedAnswerId={selectedAnswers[currentQuestion.id]}
      onAnswerSelect={handleAnswerSelection}
      onNext={handleNext}
      isLastQuestion={currentQuestionIndex === questions.length - 1}
    />
  );
};

export default QuizPlayer;
