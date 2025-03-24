
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion, QuizAnswer } from "@/types/training";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Award, Star } from "lucide-react";
import { motion } from "framer-motion";
import confetti from 'canvas-confetti';
import { useEngagement } from "@/hooks/useEngagement";
import { useToast } from "@/components/ui/use-toast";

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
  const { trackActivity } = useEngagement();
  const { celebrateSuccess } = useToast();
  const [showBadge, setShowBadge] = useState(false);
  
  useEffect(() => {
    // Track quiz completion
    trackActivity({
      activity_type: 'complete_quiz',
      points_earned: Math.round(results.earnedPoints / 10) + (showCelebration ? 5 : 0),
      metadata: {
        correct_answers: results.correctAnswers,
        total_questions: results.totalQuestions,
        score_percentage: scorePercentage
      }
    }, true);
    
    // Trigger confetti when component mounts and score is good
    if (showCelebration) {
      const fireConfetti = () => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#4CAF50', '#2196F3']
        });
      };
      
      // Initial confetti burst
      fireConfetti();
      
      // Show celebratory toast
      celebrateSuccess("Quiz Completed!", `You scored ${scorePercentage}% - Great job!`);
      
      // Add a badge animation if score is excellent
      if (scorePercentage >= 80) {
        setTimeout(() => setShowBadge(true), 1000);
      }
      
      // Additional bursts
      const timeout1 = setTimeout(fireConfetti, 700);
      const timeout2 = setTimeout(fireConfetti, 1400);
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [showCelebration, trackActivity, results, scorePercentage, celebrateSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Quiz Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div 
          className="flex justify-center mb-4 relative"
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
          
          {showBadge && (
            <motion.div 
              className="absolute -top-4 -right-4 bg-yellow-500 text-white rounded-full h-8 w-8 flex items-center justify-center"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
            >
              <Star className="h-5 w-5" />
            </motion.div>
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
          <Progress 
            value={scorePercentage} 
            className="h-2 mb-6" 
            indicatorColor={
              scorePercentage >= 80 ? "bg-green-500" : 
              scorePercentage >= 60 ? "bg-yellow-500" : 
              "bg-red-500"
            }
          />
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
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="hover-scale"
        >
          <Button 
            onClick={() => onComplete(results.earnedPoints)}
            className="relative overflow-hidden group"
          >
            <span className="relative z-10">Continue</span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
  );
};

export default QuizResults;
