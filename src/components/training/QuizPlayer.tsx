
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQuiz } from "@/hooks/useQuiz";
import QuizQuestion from "./quiz/QuizQuestion";
import QuizResults from "./quiz/QuizResults";
import CourseCompletionSummary from "./CourseCompletionSummary";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";

interface QuizPlayerProps {
  contentItemId: string;
  onComplete: (score: number) => void;
  isLastContentInCourse?: boolean;
  courseTitle?: string;
  courseId?: string;
  totalCoursePoints?: number;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ 
  contentItemId, 
  onComplete, 
  isLastContentInCourse = false,
  courseTitle = "", 
  courseId = "",
  totalCoursePoints = 0
}) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [showCourseSummary, setShowCourseSummary] = useState(false);
  
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

  const handleQuizComplete = (score: number) => {
    if (isLastContentInCourse) {
      setShowCourseSummary(true);
    } else {
      onComplete(score);
    }
  };

  if (showCourseSummary) {
    return (
      <CourseCompletionSummary 
        courseId={courseId}
        courseTitle={courseTitle}
        totalPoints={totalCoursePoints}
        earnedPoints={results.earnedPoints}
        onContinue={() => onComplete(results.earnedPoints)}
      />
    );
  }

  if (!quizStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold">Ready to Start Quiz?</h2>
              <p className="text-muted-foreground">
                This quiz contains {questions.length} questions and is worth a total of{" "}
                {questions.reduce((total, q) => total + q.points, 0)} points.
              </p>
            </motion.div>
          </CardContent>
          <CardFooter className="justify-center pb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setQuizStarted(true)}
                size="lg"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Start Quiz
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  if (isCompleted) {
    const successRate = (results.correctAnswers / results.totalQuestions) * 100;
    const isSuccessful = successRate >= 75;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isSuccessful && (
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 1 
            }}
          >
            <PartyPopper className="h-16 w-16 text-primary" />
          </motion.div>
        )}
        <QuizResults
          questions={questions}
          answers={answers}
          selectedAnswers={selectedAnswers}
          results={results}
          onRestart={() => {
            restartQuiz();
            setQuizStarted(true);
          }}
          onComplete={handleQuizComplete}
          showCelebration={isSuccessful}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key={currentQuestionIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
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
    </motion.div>
  );
};

export default QuizPlayer;
