
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuiz } from "@/hooks/useQuiz";
import QuizQuestion from "./quiz/QuizQuestion";
import QuizResults from "./quiz/QuizResults";

interface QuizPlayerProps {
  contentItemId: string;
  onComplete: (score: number) => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ contentItemId, onComplete }) => {
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

  if (isCompleted) {
    return (
      <QuizResults
        questions={questions}
        answers={answers}
        selectedAnswers={selectedAnswers}
        results={results}
        onRestart={restartQuiz}
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
