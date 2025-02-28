
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion, QuizAnswer } from "@/types/training";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Award, Star } from "lucide-react";
import { motion } from "framer-motion";
import confetti from 'canvas-confetti';

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
  showCelebration?: boolean;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  questions,
  answers,
  selectedAnswers,
  results,
  onRestart,
  onComplete,
  showCelebration = false,
}) => {
  const scorePercentage = Math.round((results.earnedPoints / results.totalPoints) * 100);
  
  useEffect(() => {
    // Trigger confetti when component mounts and score is good
    if (showCelebration) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [showCelebration]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Quiz Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div 
          className="flex justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.6 
          }}
        >
          {showCelebration ? (
            <Award className="h-16 w-16 text-primary" />
          ) : (
            <Trophy className="h-16 w-16 text-primary" />
          )}
        </motion.div>
        
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold">{scorePercentage}%</h3>
          <p className="text-muted-foreground">
            You scored {results.earnedPoints} out of {results.totalPoints} points
          </p>
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Progress value={scorePercentage} className="h-2 mb-6" />
        </motion.div>
        
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {showCelebration ? (
            <p className="font-medium flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              Great job! {results.correctAnswers} correct answers out of {results.totalQuestions} questions
              <Star className="h-5 w-5 text-yellow-500 ml-2" />
            </p>
          ) : (
            <p className="font-medium">
              {results.correctAnswers} correct answers out of {results.totalQuestions} questions
            </p>
          )}
        </motion.div>
        
        <div className="space-y-4 mt-6">
          <h4 className="font-medium">Question Summary:</h4>
          
          {questions.map((question, index) => (
            <motion.div 
              key={question.id} 
              className="flex items-start space-x-3 pb-3 border-b"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
            >
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
            </motion.div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onRestart}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Retry Quiz
        </Button>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => onComplete(results.earnedPoints)}>
            Continue
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
  );
};

export default QuizResults;
